"""
Resume parsing: extract raw text from PDF using PyMuPDF.
"""
import fitz  # PyMuPDF
import logging
import re

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract plain text from a PDF byte stream.
    Returns the concatenated text of all pages.
    Raises ValueError if the file is not a valid PDF or has no text.
    """
    try:
        doc = fitz.open(stream=file_bytes, filetype="pdf")
    except Exception as exc:
        raise ValueError(f"Cannot open PDF: {exc}") from exc

    pages_text = []
    for page_num, page in enumerate(doc):
        try:
            text = page.get_text("text")
            pages_text.append(text)
        except Exception as exc:
            logger.warning("Failed to extract text from page %d: %s", page_num, exc)

    doc.close()
    full_text = "\n".join(pages_text).strip()

    if not full_text:
        raise ValueError("PDF contains no extractable text (may be image-only).")

    return full_text


def clean_text(text: str) -> str:
    """
    Light cleanup: collapse whitespace, remove null bytes.
    """
    text = text.replace("\x00", "")
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"[ \t]{2,}", " ", text)
    return text.strip()
