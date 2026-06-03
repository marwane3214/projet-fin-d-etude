from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import easyocr
import io
from PIL import Image
import json
from pathlib import Path
from typing import List, Optional
import re
import os
import psycopg2
from Crypto.Cipher import AES
import base64
from fastapi import Form
import cv2
import numpy as np
from fuzzywuzzy import fuzz

app = FastAPI(title="CIMR AI Agent Service")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_event():
    threading.Thread(target=load_model_background).start()
    load_knowledge_dataset(build_index=True)

# Initialize EasyOCR reader (local OCR model)
try:
    reader = easyocr.Reader(['en', 'fr'])
except Exception as e:
    print("Warning: easyocr models not downloaded yet or failed to load.", e)
    reader = None

from transformers import pipeline
from sentence_transformers import SentenceTransformer, CrossEncoder, util

chatbot_pipeline = None
embedding_model = None
reranker_model = None
is_model_downloading = False
model_download_status = "Waiting to download model..."

import threading

def load_model_background():
    global chatbot_pipeline, is_model_downloading, model_download_status
    if chatbot_pipeline is not None:
        return
    is_model_downloading = True
    model_download_status = f"Downloading {GENERATOR_MODEL_NAME} (~1.5GB) ... Please wait."
    print(model_download_status)
    try:
        chatbot_pipeline = pipeline(
            "text-generation",
            model=GENERATOR_MODEL_NAME,
            max_new_tokens=220
        )
        print("Generator model loaded successfully!")
        model_download_status = "Ready"
    except Exception as e:
        print("Model load failed:", e)
        model_download_status = f"Error: {str(e)}"
    finally:
        is_model_downloading = False

def get_generator():
    return chatbot_pipeline

def get_embedding_model():
    global embedding_model
    if embedding_model is not None:
        return embedding_model
    try:
        print(f"Loading embedding model: {EMBEDDING_MODEL_NAME}")
        embedding_model = SentenceTransformer(EMBEDDING_MODEL_NAME)
    except Exception as e:
        print("Embedding model load failed:", e)
        embedding_model = None
    return embedding_model

def get_reranker_model():
    global reranker_model
    if reranker_model is not None:
        return reranker_model
    if not RERANKER_MODEL_NAME:
        return None
    try:
        print(f"Loading reranker model: {RERANKER_MODEL_NAME}")
        reranker_model = CrossEncoder(RERANKER_MODEL_NAME)
    except Exception as e:
        print("Reranker model load failed:", e)
        reranker_model = None
    return reranker_model

class ChatRequest(BaseModel):
    query: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    response: str
    is_error: bool = False

class KnowledgeReloadResponse(BaseModel):
    loaded_documents: int
    message: str

# Knowledge dataset path (RAG source)
KNOWLEDGE_DATASET_PATH = Path(__file__).parent / "knowledge" / "cimr_knowledge.json"

# In-memory retrieval state
knowledge_docs = []
knowledge_text_chunks = []
knowledge_embeddings = None
conversation_memory = {}
MAX_MEMORY_TURNS = int(os.getenv("MAX_MEMORY_TURNS", "8"))

FRENCH_HINTS = [
    "bonjour", "merci", "retraite", "pension", "cimr", "affilie",
    "quels", "quelle", "comment", "pourquoi", "piece", "documents"
]
ARABIC_CHAR_RE = re.compile(r"[\u0600-\u06FF]")
LATIN_WORD_RE = re.compile(r"[A-Za-z]{3,}")
USE_LLM_SYNTHESIS = os.getenv("USE_LLM_SYNTHESIS", "true").lower() == "true"
GENERATOR_MODEL_NAME = os.getenv("GENERATOR_MODEL_NAME", "Qwen/Qwen2.5-0.5B-Instruct")
EMBEDDING_MODEL_NAME = os.getenv("EMBEDDING_MODEL_NAME", "sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
RERANKER_MODEL_NAME = os.getenv("RERANKER_MODEL_NAME", "cross-encoder/mmarco-mMiniLMv2-L12-H384-v1")
EVIDENCE_MIN_TOP_SCORE = float(os.getenv("EVIDENCE_MIN_TOP_SCORE", "0.62"))
EVIDENCE_MIN_AVG_TOP3 = float(os.getenv("EVIDENCE_MIN_AVG_TOP3", "0.50"))
FOLLOWUP_MIN_TOP_SCORE = float(os.getenv("FOLLOWUP_MIN_TOP_SCORE", "0.52"))
FOLLOWUP_MIN_AVG_TOP3 = float(os.getenv("FOLLOWUP_MIN_AVG_TOP3", "0.42"))

def load_knowledge_dataset(build_index: bool = True) -> int:
    global knowledge_docs, knowledge_text_chunks, knowledge_embeddings
    if not KNOWLEDGE_DATASET_PATH.exists():
        knowledge_docs = []
        knowledge_text_chunks = []
        knowledge_embeddings = None
        return 0
    with open(KNOWLEDGE_DATASET_PATH, "r", encoding="utf-8") as f:
        docs = json.load(f)
    knowledge_docs = [d for d in docs if not d.get("confidential", False)]
    knowledge_text_chunks = [
        f"{d.get('title', '')}\n{d.get('content', '')}".strip()
        for d in knowledge_docs
    ]
    if not knowledge_text_chunks:
        knowledge_embeddings = None
        return 0
    if not build_index:
        knowledge_embeddings = None
        return len(knowledge_docs)
    emb_model = get_embedding_model()
    if emb_model:
        knowledge_embeddings = emb_model.encode(
            knowledge_text_chunks,
            convert_to_tensor=True,
            normalize_embeddings=True,
            show_progress_bar=False
        )
    else:
        knowledge_embeddings = None
    return len(knowledge_docs)

def detect_query_topic(query: str) -> str:
    q = query.lower()
    if "orphelin" in q: return "orphelin"
    if "reversion" in q: return "reversion"
    if "principale" in q: return "principale"
    if "capital" in q and "deces" in q: return "deces"
    if "points" in q: return "points"
    if "abonnement" in q: return "abonnement"
    if "mise a jour" in q or "mise-à-jour" in q or "informations personnelles" in q: return "mise_a_jour"
    return "general"

def retrieve_relevant_knowledge(query: str, top_k: int = 4, min_score: float = 0.08) -> List[dict]:
    emb_model = get_embedding_model()
    if knowledge_embeddings is None or not knowledge_docs or not emb_model: return []
    query_embedding = emb_model.encode([query], convert_to_tensor=True, normalize_embeddings=True)
    scores_tensor = util.cos_sim(query_embedding, knowledge_embeddings)[0]
    scores = scores_tensor.detach().cpu().numpy()
    query_topic = detect_query_topic(query)
    adjusted_scores = []
    for idx, score in enumerate(scores):
        doc_topic = knowledge_docs[idx].get("topic", "general")
        boosted = float(score)
        if query_topic != "general":
            if doc_topic == query_topic: boosted += 0.25
            elif doc_topic != "general": boosted -= 0.20
        adjusted_scores.append(boosted)
    ranked_indices = sorted(range(len(adjusted_scores)), key=lambda i: adjusted_scores[i], reverse=True)
    candidate_indices = ranked_indices[: max(top_k * 6, 24)]
    rr_model = get_reranker_model()
    rerank_norm = {}
    if rr_model and candidate_indices:
        pairs = [[query, f"{knowledge_docs[idx].get('title', '')}\n{knowledge_docs[idx].get('content', '')}"] for idx in candidate_indices]
        try:
            rerank_scores = rr_model.predict(pairs)
            raw_scores = [float(s) for s in rerank_scores]
            s_min, s_max = min(raw_scores), max(raw_scores)
            denom = (s_max - s_min) if (s_max - s_min) > 1e-8 else 1.0
            for idx, s in zip(candidate_indices, raw_scores):
                rerank_norm[idx] = (s - s_min) / denom
        except: pass
    final_scored = []
    for idx in candidate_indices:
        base_score = float(adjusted_scores[idx])
        final_score = (0.35 * base_score) + (0.65 * rerank_norm.get(idx, 0.0)) if rerank_norm else base_score
        final_scored.append((idx, final_score))
    final_scored.sort(key=lambda x: x[1], reverse=True)
    results = []
    for idx, score in final_scored[:top_k]:
        if score < min_score: continue
        doc = knowledge_docs[idx]
        results.append({
            "title": doc.get("title", "Untitled"),
            "content": doc.get("content", ""),
            "category": doc.get("category", "general"),
            "source": doc.get("source", "unknown"),
            "topic": doc.get("topic", "general"),
            "score": score
        })
    return results

def _normalize_text_for_match(text: str) -> str:
    text = text.lower()
    text = re.sub(r"[^a-zA-ZÀ-ÿ0-9\u0600-\u06FF\s]", " ", text)
    text = re.sub(r"\s+", " ", text).strip()
    return text

def deep_analyze_context(query: str, docs: List[dict], max_passages: int = 10) -> List[dict]:
    if not docs: return []
    query_clean = _normalize_text_for_match(query)
    query_terms = set(w for w in query_clean.split() if len(w) >= 3)
    candidates = []
    for d in docs[:12]:
        text = d.get("content", "")
        if not text: continue
        sentences = re.split(r"(?<=[\.\!\?؛])\s+", text)
        for s_idx, s in enumerate(sentences):
            s_clean = s.strip()
            if len(s_clean) < 40 or len(s_clean) > 420: continue
            normalized = _normalize_text_for_match(s_clean)
            if not normalized: continue
            overlap = sum(1 for t in query_terms if t in normalized)
            density = overlap / max(1, len(query_terms))
            score = (0.50 * float(d.get("score", 0.0))) + (0.35 * density) + (0.08 if d.get("topic", "general") != "general" else 0.0)
            candidates.append({"text": s_clean, "title": d.get("title", "Untitled"), "source": d.get("source", "unknown"), "score": score})
    if not candidates: return []
    candidates.sort(key=lambda x: x["score"], reverse=True)
    candidates = candidates[:140]
    rr_model = get_reranker_model()
    if rr_model:
        try:
            pairs = [[query, c["text"]] for c in candidates]
            rr_scores = [float(v) for v in rr_model.predict(pairs)]
            r_min, r_max = min(rr_scores), max(rr_scores)
            denom = (r_max - r_min) if (r_max - r_min) > 1e-8 else 1.0
            for c, rr in zip(candidates, rr_scores):
                c["score"] = (0.30 * float(c["score"])) + (0.70 * (rr - r_min) / denom)
        except: pass
    candidates.sort(key=lambda x: x["score"], reverse=True)
    selected, seen = [], set()
    for c in candidates:
        key = _normalize_text_for_match(c["text"])[:170]
        if key not in seen:
            seen.add(key); selected.append(c)
            if len(selected) >= max_passages: break
    return selected

def has_strong_evidence(evidence_passages: List[dict], is_followup: bool = False) -> bool:
    if len(evidence_passages) < 2: return False
    scores = [p.get("score", 0.0) for p in evidence_passages]
    if is_followup: return scores[0] >= FOLLOWUP_MIN_TOP_SCORE and (sum(scores[:3])/3) >= FOLLOWUP_MIN_AVG_TOP3
    return scores[0] >= EVIDENCE_MIN_TOP_SCORE and (sum(scores[:3])/3) >= EVIDENCE_MIN_AVG_TOP3

def build_contextual_query(query: str, session_id: Optional[str]) -> str:
    if not session_id or session_id not in conversation_memory: return query
    recent = [h.get("user", "") for h in conversation_memory[session_id][-3:] if h.get("user", "")]
    return " | ".join(recent + [query]) if recent else query

def remember_turn(session_id: Optional[str], user_query: str, assistant_response: str) -> None:
    if not session_id: return
    turns = conversation_memory.get(session_id, [])
    turns.append({"user": user_query, "assistant": assistant_response})
    conversation_memory[session_id] = turns[-MAX_MEMORY_TURNS:]

def is_followup_query(query: str) -> bool:
    q = query.strip().lower()
    words = re.findall(r"[a-zA-ZÀ-ÿ\u0600-\u06FF]+", q)
    markers = {"et", "aussi", "sinon", "alors", "concernant", "pour", "ca", "ça"}
    return len(words) <= 6 or any(w in markers for w in words)

def sanitize_response_text(text: str) -> str:
    if not text: return text
    lines = []
    for line in text.splitlines():
        lower = line.lower()
        if any(x in lower for x in ["www.", "http", "téléphone", "tel"]): continue
        if len(re.findall(r"\d", line)) >= 8: continue
        lines.append(line)
    return "\n".join(lines).strip() or "Désolé, information non disponible."

def detect_language(query: str) -> str:
    return "ar" if ARABIC_CHAR_RE.search(query) else "fr"

def synthesize_grounded_answer(query: str, docs: List[dict], lang: str, evidence_passages: Optional[List[dict]] = None) -> str:
    compact = []
    source_list = evidence_passages[:10] if evidence_passages else docs[:4]
    for idx, p in enumerate(source_list, 1):
        compact.append(f"[DOC {idx}] {p.get('text') or p.get('content')}")
    context = "\n\n".join(compact)
    gen = get_generator()
    if gen and USE_LLM_SYNTHESIS:
        messages = [
            {"role": "system", "content": f"Multilingual assistant for CIMR. Answer facts in {lang}. Use CONTEXT only."},
            {"role": "user", "content": f"CONTEXT:\n{context}\n\nQUESTION:\n{query}"}
        ]
        try:
            prompt = gen.tokenizer.apply_chat_template(messages, tokenize=False, add_generation_prompt=True)
            return gen(prompt, return_full_text=False, max_new_tokens=250)[0]["generated_text"].strip()
        except: pass
    return build_extractive_french_answer(query, docs, evidence_passages)

def build_extractive_french_answer(query: str, docs: List[dict], evidence_passages: Optional[List[dict]] = None) -> str:
    lines = ["Voici les informations trouvées :"]
    for p in (evidence_passages[:3] if evidence_passages else docs[:2]):
        lines.append(f"- {p.get('text') or p.get('content')[:200]}...")
    return "\n".join(lines)

def detect_query_intent(query: str) -> str:
    q = query.lower()
    if any(k in q for k in ["document", "fournir", "liste"]): return "documents"
    if any(k in q for k in ["coordonnee", "adresse", "contact"]): return "contact"
    return "general"

def filter_docs_by_intent(docs: List[dict], intent: str) -> List[dict]:
    keywords = {"documents": ["pièce", "liste", "document"], "contact": ["adresse", "tel", "casablanca"]}
    kws = keywords.get(intent, [])
    if not kws: return docs
    filtered = [d for d in docs if any(k in (d.get("title","") + d.get("content","")).lower() for k in kws)]
    return filtered or docs

def extract_docs_answer(docs: List[dict]) -> str:
    return "Documents requis : CIN, Attestation, Formulaire signé."

@app.post("/api/ai/chat", response_model=ChatResponse)
async def chat_with_agent(req: ChatRequest):
    if knowledge_embeddings is None: load_knowledge_dataset(build_index=True)
    retrieval_query = build_contextual_query(req.query, req.session_id)
    relevant_docs = retrieve_relevant_knowledge(retrieval_query, top_k=12)
    intent = detect_query_intent(req.query)
    relevant_docs = filter_docs_by_intent(relevant_docs, intent)
    evidence = deep_analyze_context(retrieval_query, relevant_docs)
    lang = detect_language(req.query)
    answer = synthesize_grounded_answer(req.query, relevant_docs, lang, evidence)
    response = sanitize_response_text(answer)
    remember_turn(req.session_id, req.query, response)
    return {"response": response}

@app.get("/api/ai/status")
async def get_model_status():
    return {"model_ready": chatbot_pipeline is not None, "downloading": is_model_downloading, "status": model_download_status}

def extract_moroccan_id_info(ocr_results):
    full_text = " ".join([res[1] for res in ocr_results])
    print(f"--- OCR Full Text ---\n{full_text}\n-------------------")
    
    # 1. Improved CIN Regex (Standard Moroccan prefixes + flexibility)
    cin_pattern = r'\b([A-Z]{1,2}\s?\d{3,8})\b'
    cin_m = re.search(cin_pattern, full_text, re.IGNORECASE)
    cin = cin_m.group(1).replace(" ", "").upper() if cin_m else None
    
    # Fallback for CIN if regex failed but we have blocks of text
    if not cin:
        for res in ocr_results:
            t = res[1].replace(" ", "").upper()
            if re.match(r'^[A-Z]{1,2}\d{3,8}$', t):
                cin = t
                break

    # 2. Improved Date of Birth
    dob_pattern = r'\b(\d{2}[/.\-\s]\d{2}[/.\-\s]\d{4})\b'
    dob_m = re.search(dob_pattern, full_text)
    dob = re.sub(r'[/.\-\s]', '/', dob_m.group(1)) if dob_m else None
    
    # 3. Name Extraction improvements
    potential_names = []
    ignore_words = {'ROYAUME', 'MAROC', 'CARTE', 'NATIONALE', 'IDENTITE', 'MARRAKCH', 'CASABLANCA', 'RABAT'}
    for res in ocr_results:
        t = res[1].strip()
        if len(re.findall(r'[A-Z]', t)) > 3 and not any(w in t.upper() for w in ignore_words):
            if not re.search(r'\d', t):
                potential_names.append(t)
    
    full_name = " ".join(potential_names[:2]) if potential_names else "Not Found"
    print(f"Extracted -> CIN: {cin}, DOB: {dob}, Name: {full_name}")
    return cin, dob, full_name, full_text

def preprocess_image(image_bytes):
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    # Convert to grayscale
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    # Increase contrast
    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
    enhanced = clahe.apply(gray)
    # Binary threshold search
    _, thresh = cv2.threshold(enhanced, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    return [img, gray, enhanced, thresh]

def get_db_connection(dbname):
    return psycopg2.connect(
        dbname=dbname,
        user="cimr",
        password="cimr_secret_2024",
        host="localhost",
        port="5435"
    )

def decrypt_java_aes(encrypted_text):
    if not encrypted_text: return None
    try:
        key = "MySuperSecretKey".encode('utf-8')[:16]
        cipher = AES.new(key, AES.MODE_ECB)
        decoded = base64.b64decode(encrypted_text)
        decrypted = cipher.decrypt(decoded)
        padding_len = decrypted[-1]
        return decrypted[:-padding_len].decode('utf-8') if 0 < padding_len <= 16 else decrypted.decode('utf-8', errors='ignore').strip()
    except: return None

def encrypt_java_aes(plain_text):
    if not plain_text: return None
    try:
        key = b"MySuperSecretKey"[:16]
        cipher = AES.new(key, AES.MODE_ECB)
        pad_len = 16 - (len(plain_text.encode('utf-8')) % 16)
        padded = plain_text.encode('utf-8') + bytes([pad_len] * pad_len)
        encrypted = cipher.encrypt(padded)
        return base64.b64encode(encrypted).decode('utf-8')
    except: return None

@app.post("/api/ai/verify-id")
async def verify_id(file: UploadFile = File(...), username: Optional[str] = Form(None)):
    contents = await file.read()
    try:
        # 1. Image Preprocessing for better OCR
        variants = preprocess_image(contents)
        
        cin, dob, full_name, full_text = None, None, "Not Found", ""
        
        # Try OCR on different variants (enhanced, gray, original)
        for img_variant in variants:
            for angle in [0, 90, 180, 270]:
                processed = img_variant
                if angle != 0:
                    (h, w) = processed.shape[:2]
                    center = (w // 2, h // 2)
                    M = cv2.getRotationMatrix2D(center, angle, 1.0)
                    processed = cv2.warpAffine(processed, M, (w, h))
                
                res = reader.readtext(processed)
                t_cin, t_dob, t_name, t_text = extract_moroccan_id_info(res)

                # Garder la PREMIERE valeur valide trouvee : une passe ulterieure
                # sur une image tournee/bruitee ne doit pas ecraser un bon resultat.
                if t_cin and not cin: cin = t_cin
                if t_dob and not dob: dob = t_dob
                if t_name != "Not Found" and full_name == "Not Found": full_name = t_name
                full_text += t_text + " "
                
                if cin and dob and full_name != "Not Found": break
            if cin and dob and full_name != "Not Found": break
        
        real_password = None
        is_verified = False
        
        if username or cin:
            try:
                # Direct Authentication Strategy using the injected profile ID
                if username and cin:
                    auth_conn = get_db_connection("cimr_auth")
                    cur = auth_conn.cursor()
                    # We query the directly mapped `cin` inside users
                    cur.execute("SELECT cin FROM users WHERE TRIM(UPPER(username)) = %s", (username.strip().upper(),))
                    user_row = cur.fetchone()
                    
                    if user_row and user_row[0]:
                        db_cin = user_row[0]
                        # We compare extracted cin versus the database cin
                        # Since OCR might miss a digit, we can use fuzzy match > 80, or exact match
                        if cin.upper().replace(" ", "") == db_cin.upper().replace(" ", "") or fuzz.ratio(cin.upper(), db_cin.upper()) > 80:
                            is_verified = True
                    
                    cur.close(); auth_conn.close()
                    
            except Exception as e: print("Validation Error:", e)
            
        return {"status": "success", "extracted": {"cin": cin or "Non détecté", "full_name": full_name, "birthday": dob or "Non détecté", "password": real_password, "verified": is_verified}}
    except Exception as e: 
        print(f"Critical Verify Error: {str(e)}")
        raise HTTPException(status_code=400, detail=str(e))

class ResetRequest(BaseModel):
    username: str
    new_password: str

@app.post("/api/ai/reset-password")
async def reset_password(req: ResetRequest):
    try:
        import bcrypt
        print(f"Reseting password for user: {req.username}")
        hashed = bcrypt.hashpw(req.new_password.encode('utf-8'), bcrypt.gensalt(10, prefix=b"2a")).decode('utf-8')
        
        conn = get_db_connection("cimr_auth")
        cur = conn.cursor()
        cur.execute(
            "UPDATE users SET password = %s WHERE TRIM(UPPER(username)) = TRIM(UPPER(%s))",
            (hashed, req.username)
        )
        affected = cur.rowcount
        conn.commit()
        cur.close()
        conn.close()
        
        if affected == 0:
            print(f"Warning: No user found with username {req.username}")
            return {"status": "error", "message": "User not found"}
            
        print(f"Successfully updated password for {req.username}")
        return {"status": "success", "message": "Password updated successfully."}
    except Exception as e:
        print("Reset Error:", e)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
