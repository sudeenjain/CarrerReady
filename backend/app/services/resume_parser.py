from __future__ import annotations

import io

from fastapi import HTTPException, UploadFile, status
from pypdf import PdfReader
import docx


MAX_BYTES = 5 * 1024 * 1024  # 5MB


async def extract_text_from_upload(file: UploadFile) -> str:
  raw = await file.read()
  if len(raw) > MAX_BYTES:
    raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="File too large (max 5MB)")

  filename = (file.filename or "").lower()
  ctype = (file.content_type or "").lower()

  if filename.endswith(".pdf") or ctype == "application/pdf":
    return _extract_pdf(raw)

  if filename.endswith(".docx") or ctype in (
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/octet-stream",
  ):
    return _extract_docx(raw)

  raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Unsupported file type (use PDF or DOCX)")


def _extract_pdf(raw: bytes) -> str:
  reader = PdfReader(io.BytesIO(raw))
  parts: list[str] = []
  for p in reader.pages:
    parts.append(p.extract_text() or "")
  return "\n".join(parts).strip()


def _extract_docx(raw: bytes) -> str:
  doc = docx.Document(io.BytesIO(raw))
  parts = [p.text for p in doc.paragraphs if p.text]
  return "\n".join(parts).strip()

