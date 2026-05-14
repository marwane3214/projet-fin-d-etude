import json
from pathlib import Path
import re
from typing import List
from collections import Counter

from pypdf import PdfReader

BASE_DIR = Path(__file__).parent
SOURCE_DIR = BASE_DIR / "knowledge" / "sources"
OUTPUT_FILE = BASE_DIR / "knowledge" / "cimr_knowledge.json"
PDF_DIR = BASE_DIR.parent / "pdfs"

CHUNK_WORDS = 220
CHUNK_OVERLAP = 40


def normalize_text(text: str) -> str:
    text = text.replace("\x00", " ")
    text = text.replace("�", " ")
    text = text.replace("??", " ")
    text = re.sub(r"[^\w\s.,;:!?%()/'\"+-]", " ", text, flags=re.UNICODE)
    text = re.sub(r"\s+", " ", text).strip()
    return text


def is_low_quality_text(text: str) -> bool:
    if not text:
        return True
    if len(text) < 120:
        return True

    weird_count = sum(1 for c in text if c in {"�", "?", "□", "■"})
    ratio = weird_count / max(1, len(text))
    return ratio > 0.12


def cleanup_ocr_noise(text: str) -> str:
    """
    OCR-oriented cleanup:
    - remove long placeholder dot lines
    - remove repeated punctuation bursts
    - remove visually broken separators
    """
    text = re.sub(r"\.{8,}", " ", text)
    text = re.sub(r"[_\-]{6,}", " ", text)
    text = re.sub(r"[|]{2,}", " ", text)
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def remove_common_header_footer_lines(lines: List[str]) -> List[str]:
    """
    Remove lines repeated on many pages (headers/footers/contact blocks),
    which often pollute retrieval.
    """
    stripped = [ln.strip() for ln in lines if ln.strip()]
    if not stripped:
        return []

    counts = Counter(stripped)
    threshold = max(3, int(len(stripped) * 0.12))
    noisy = {line for line, c in counts.items() if c >= threshold and len(line) < 120}
    return [ln for ln in stripped if ln not in noisy]


def split_into_sections(raw_text: str) -> List[tuple[str, str]]:
    """
    Chunk by section headings first (better than blind fixed window).
    Returns list of (section_title, section_text).
    """
    lines = [ln.strip() for ln in raw_text.splitlines() if ln.strip()]
    lines = remove_common_header_footer_lines(lines)

    sections: List[tuple[str, List[str]]] = []
    current_title = "section_generale"
    current_body: List[str] = []

    heading_re = re.compile(
        r"^(article\s+\d+|pi[eè]ces|liste|demande|note|conditions|modalit[eé]s|proc[eé]dure|formulaire)\b",
        re.IGNORECASE,
    )

    for ln in lines:
        is_caps_heading = ln.isupper() and 4 <= len(ln) <= 100
        is_named_heading = bool(heading_re.match(ln))
        looks_like_heading = is_caps_heading or is_named_heading

        if looks_like_heading:
            if current_body:
                sections.append((current_title, current_body))
            current_title = normalize_text(ln).replace(" ", "_").lower()[:80] or "section_generale"
            current_body = []
        else:
            current_body.append(ln)

    if current_body:
        sections.append((current_title, current_body))

    out: List[tuple[str, str]] = []
    for title, body_lines in sections:
        block = cleanup_ocr_noise(normalize_text(" ".join(body_lines)))
        if block:
            out.append((title, block))
    return out


def chunk_text(text: str, chunk_words: int = CHUNK_WORDS, overlap: int = CHUNK_OVERLAP) -> List[str]:
    words = text.split()
    if not words:
        return []

    chunks = []
    step = max(1, chunk_words - overlap)
    for start in range(0, len(words), step):
        part = words[start:start + chunk_words]
        if len(part) < 25:
            continue
        chunks.append(" ".join(part))
        if start + chunk_words >= len(words):
            break
    return chunks


def should_be_confidential(file_path: Path) -> bool:
    name = file_path.stem.lower()
    keywords = [
        "interne",
        "internal",
        "secret",
        "confidentiel",
        "confidential",
        "admin",
    ]
    return any(k in name for k in keywords)


def infer_topic(file_path: Path) -> str:
    name = file_path.stem.lower()
    if "orphelin" in name:
        return "orphelin"
    if "reversion" in name:
        return "reversion"
    if "principale" in name:
        return "principale"
    if "capital-deces" in name or "deces" in name:
        return "deces"
    if "points" in name:
        return "points"
    if "abonnement" in name:
        return "abonnement"
    if "mise-a-jour" in name or "informations-personnelles" in name:
        return "mise_a_jour"
    return "general"


def add_text_sources(dataset: list) -> int:
    added = 0
    SOURCE_DIR.mkdir(parents=True, exist_ok=True)
    for file_path in sorted(SOURCE_DIR.glob("*.txt")):
        stem_parts = file_path.stem.split("__", maxsplit=2)
        if len(stem_parts) != 3:
            continue

        visibility, category, title = stem_parts
        raw = file_path.read_text(encoding="utf-8")
        sections = split_into_sections(raw)
        if not sections:
            continue

        for sec_i, (sec_title, sec_text) in enumerate(sections, start=1):
            for idx, chunk in enumerate(chunk_text(sec_text), start=1):
                dataset.append(
                    {
                        "id": f"{file_path.stem}__s{sec_i}__chunk_{idx}",
                        "title": f"{title.replace('_', ' ')} - {sec_title} (part {idx})",
                        "category": category,
                        "confidential": visibility.lower() != "public",
                        "content": chunk,
                        "source": str(file_path.name),
                        "topic": infer_topic(file_path),
                        "section": sec_title,
                    }
                )
                added += 1
    return added


def add_pdf_sources(dataset: list) -> int:
    added = 0
    if not PDF_DIR.exists():
        return added

    seen_chunks = set()
    for pdf_path in sorted(PDF_DIR.glob("*.pdf")):
        try:
            reader = PdfReader(str(pdf_path))
            pages_text = []
            for page in reader.pages:
                page_text = page.extract_text() or ""
                if page_text:
                    pages_text.append(page_text)
            raw_text = "\n".join(pages_text)
            sections = split_into_sections(raw_text)
            full_text = normalize_text(raw_text)
            if not full_text or is_low_quality_text(full_text) or not sections:
                continue

            confidentiality = should_be_confidential(pdf_path)
            topic = infer_topic(pdf_path)
            category = "documents"
            title = pdf_path.stem.replace("-", " ").replace("_", " ")
            for sec_i, (sec_title, sec_text) in enumerate(sections, start=1):
                for idx, chunk in enumerate(chunk_text(sec_text), start=1):
                    chunk = cleanup_ocr_noise(normalize_text(chunk))
                    if is_low_quality_text(chunk):
                        continue
                    chunk_key = chunk.lower()
                    if chunk_key in seen_chunks:
                        continue
                    seen_chunks.add(chunk_key)
                    dataset.append(
                        {
                            "id": f"pdf__{pdf_path.stem}__s{sec_i}__chunk_{idx}",
                            "title": f"{title} - {sec_title} (part {idx})",
                            "category": category,
                            "confidential": confidentiality,
                            "content": chunk,
                            "source": str(pdf_path.name),
                            "topic": topic,
                            "section": sec_title,
                        }
                    )
                    added += 1
        except Exception as exc:
            print(f"Skipping unreadable PDF: {pdf_path.name} ({exc})")
    return added


def build_dataset() -> None:
    """
    Build a JSON knowledge dataset from text files.
    File naming convention:
      public__<category>__<title>.txt
      confidential__<category>__<title>.txt
    """
    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)

    dataset = []
    txt_count = add_text_sources(dataset)
    pdf_count = add_pdf_sources(dataset)

    OUTPUT_FILE.write_text(
        json.dumps(dataset, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    print(
        "Knowledge dataset written: "
        f"{OUTPUT_FILE} ({len(dataset)} chunks: {txt_count} txt + {pdf_count} pdf)"
    )


if __name__ == "__main__":
    build_dataset()
