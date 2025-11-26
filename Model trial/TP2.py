import fitz
import re
import pandas as pd
from transformers import AutoTokenizer, AutoModel
import torch
tokenizer = AutoTokenizer.from_pretrained("allenai/scibert_scivocab_uncased")
model = AutoModel.from_pretrained("allenai/scibert_scivocab_uncased")

ADAS_KEYWORDS = [
    "ADAS", "autonomous", "lane", "radar", "camera", "detection",
    "warning", "blind spot", "collision", "ACC", "AEB",
    "traffic sign", "control unit", "lighting", "indicator"
]


def semantic_score(text, keywords):
    """Return semantic similarity score (0–1)."""
    inputs = tokenizer(text, return_tensors="pt", truncation=True, max_length=256)
    kw_inputs = tokenizer(" ".join(keywords), return_tensors="pt")

    with torch.no_grad():
        emb1 = model(**inputs).last_hidden_state.mean(dim=1)
        emb2 = model(**kw_inputs).last_hidden_state.mean(dim=1)

    score = torch.nn.functional.cosine_similarity(emb1, emb2)
    return float(score)


PARENT_FUNC = re.compile(
    r"^(\d+\.\d+)\s+(.*)\((CF-[A-Z0-9_]+-v\d+)\)",
    re.IGNORECASE
)

FUNC_CODE = re.compile(r"Function code:\s*(.*)", re.IGNORECASE)
DOMAIN = re.compile(r"Domain:\s*(.*)", re.IGNORECASE)
OWNER = re.compile(r"Logical owner:\s*(.*)", re.IGNORECASE)


def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    text = ""
    for page in doc:
        text += page.get_text() + "\n"
    return text


def extract_parent_blocks(text):
    lines = text.split("\n")
    blocks = []

    current_title = None
    current_func_id = None
    buffer = []

    for line in lines:
        m = PARENT_FUNC.match(line.strip())
        if m:
            if current_title:
                blocks.append((current_title, current_func_id, "\n".join(buffer)))
            current_title = m.group(2)
            current_func_id = m.group(3)
            buffer = []
            continue

        if current_title:
            buffer.append(line.strip())

    if current_title:
        blocks.append((current_title, current_func_id, "\n".join(buffer)))

    return blocks


def process_pdf_ml(pdf_path, output_xlsx, threshold=0.45):
    """ML-driven ADAS detection."""
    text = extract_text(pdf_path)
    blocks = extract_parent_blocks(text)

    results = []

    for title, fid, content in blocks:
        score = semantic_score(content, ADAS_KEYWORDS)

        if score < threshold:
            continue  

        func_code = FUNC_CODE.search(content)
        domain = DOMAIN.search(content)
        owner = OWNER.search(content)

        results.append({
            "Function Title": title,
            "Function ID": fid,
            "Semantic ADAS Score": round(score, 3),
            "Function Code": func_code.group(1).strip() if func_code else "",
            "Domain": domain.group(1).strip() if domain else "",
            "Owner Team": owner.group(1).strip() if owner else "",
            "Extracted Content": content[:5000]
        })

    df = pd.DataFrame(results)
    df.to_excel(output_xlsx, index=False)
    print(f"ML-based ADAS Excel created: {output_xlsx}")


if __name__ == "__main__":
    PDF = r"C:/Users/jorda/Downloads/COT/Exterior Lighting — Customer Function-v2 1.pdf"
    OUTPUT = "adas_ml_output.xlsx"
    process_pdf_ml(PDF, OUTPUT)
