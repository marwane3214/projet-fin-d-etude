# CIMR Knowledge Training (Safe)

This service now uses a Retrieval-Augmented Generation (RAG) flow for CIMR Q&A.

## Why this approach

- Better for company knowledge than full model fine-tuning
- Faster updates when policies/procedures change
- Easy confidentiality control per document

## Dataset format

Primary file: `knowledge/cimr_knowledge.json`

Each document must follow:

```json
{
  "id": "unique-id",
  "title": "Document title",
  "category": "retraite",
  "confidential": false,
  "content": "Public CIMR information..."
}
```

Rules:

- `confidential: true` documents are excluded from retrieval
- Use concise, factual, validated company text
- Split large documents into smaller chunks for better matching

## Build dataset from text files

1. Put `.txt` files under `knowledge/sources`
2. Use naming:
   - `public__<category>__<title>.txt`
   - `confidential__<category>__<title>.txt`
3. Generate JSON:

```bash
python prepare_knowledge_dataset.py
```

## Build dataset from your root `pdfs` folder

If you place CIMR PDFs in the project root folder `pdfs`, the script automatically ingests them:

- Path used: `../pdfs` from `ai-agent-service`
- PDFs are extracted, normalized, and split into semantic chunks
- Files with names containing `interne`, `confidential`, `secret`, or `admin` are marked confidential

Then regenerate dataset with:

```bash
python prepare_knowledge_dataset.py
```

## Reload without restarting server

```bash
curl -X POST http://localhost:8085/api/ai/reload-knowledge
```
