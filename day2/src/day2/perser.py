import os
from pyPDF2 import PdfReader
from docx import Document


def perse_pdf(file_path:str) ->str:
    reader = PdfReader(file_path)
    text=""
    for page in reader.pages:
        text+=page.extract_text()+"\n"
    return text.strip()

def parse_docx(file_path: str) -> str:
    doc = Document(file_path)
    text = "\n".join([para.text for para in doc.paragraphs])
    return text.strip()


def parse_resume(file_path: str) -> str:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return parse_pdf(file_path)
    elif ext == ".docx":
        return parse_docx(file_path)
    else:
        raise ValueError(f"Unsupported file format: {ext}. Use PDF or DOCX.")