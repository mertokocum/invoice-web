import os
import shutil
import json
import re
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.responses import JSONResponse

from langchain.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM
from ocr import ocr_yap

app = FastAPI(title="Invoice OCR Extraction API")

# ✅ Promptlar: Fiş ve Fatura için ayrı ayrı
invoice_prompt = ChatPromptTemplate.from_messages([
    ("system", "Sen bir *fatura* analiz aracı olarak çalışıyorsun. "
               "Sadece geçerli JSON nesnesi dön. Başka hiçbir şey göndermeyeceksin."),
    ("human", "OCR Metni:\n{invoice_text}\n\n"
              "Çıkarılması gereken alanlar: "
              "magazaBilgisi (unvan, adres, fisNumarasi, tarih), "
              "musteriBilgisi (isim, soyisim, telfon, email, vergino), "
              "urunKalemleri (liste; her kalem: urunAdi, urunKodu, miktar, birimFiyat, satirToplam), "
              "odemeBilgileri (araToplam, vergiOrani, vergiTutari, yuvarlama, genelToplam, odenenTutar, paraUstu).")
])

receipt_prompt = ChatPromptTemplate.from_messages([
    ("system", "Sen bir *fiş* analiz aracı olarak çalışıyorsun. "
               "Sadece geçerli JSON nesnesi dön. Başka hiçbir şey göndermeyeceksin."),
    ("human", "OCR Metni:\n{invoice_text}\n\n"
              "Çıkarılması gereken alanlar: "
              "magazaBilgisi (unvan, adres, tarih, fisNumarasi), "
              "urunKalemleri (liste; her kalem: urunAdi, miktar, birimFiyat, toplam), "
              "odemeBilgileri (genelToplam, odenenTutar, paraUstu).")
])

# ✅ OCR'dan metin çıkaran fonksiyon
async def extract_text_from_file(file: UploadFile) -> str:
    suffix = ".jpg" if file.filename.lower().endswith(('.jpg', '.jpeg')) else ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    return ocr_yap(tmp_path) or ""

# ✅ LLM ile metni işleyen fonksiyon
def parse_invoice_with_llm(text: str, model: str, doc_type: str) -> dict:
    prompt = invoice_prompt if doc_type == "fatura" else receipt_prompt
    llm = OllamaLLM(model=model, temperature=0)
    chain = prompt | llm
    raw_output = chain.invoke({"invoice_text": text})

    obj_match = re.search(r'(\{[\s\S]*\})', raw_output)
    if not obj_match:
        raise HTTPException(status_code=502, detail=f"JSON ayrıştırılamadı. Çıktı:\n{raw_output}")

    json_str = obj_match.group(1)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"JSON parse hatası: {e.msg}\n{json_str}")

# ✅ FastAPI endpoint (model + docType dahil)
@app.post("/extract-invoice", response_class=JSONResponse)
async def extract_invoice(
    file: UploadFile = File(...),
    model: str = Form("gemma3:12b"),
    docType: str = Form("fatura")
):
    text = await extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="OCR metni alınamadı veya boş.")
    parsed = parse_invoice_with_llm(text, model=model, doc_type=docType)
    return JSONResponse(content=parsed)
