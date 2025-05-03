import os
import shutil
import json
import re
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse

from langchain.prompts import ChatPromptTemplate
from langchain_ollama import OllamaLLM  # ✅ Yeni API
from ocr import ocr_yap  # OCR işlemini yapan senin kendi fonksiyonun

app = FastAPI(title="Invoice OCR Extraction API")

# ✅ Prompt Template
invoice_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "Sen bir fatura/fiş analiz aracı olarak çalışıyorsun. "
     "Sadece geçerli JSON nesnesi dön. Başka hiçbir şey gönderme. "
     "Alanlar:\n"
     "- magazaBilgisi: unvan, adres, fisNumarasi\n"
     "- tarih: (fatura tarihi - sadece gün/ay/yıl formatında)\n"
     "- musteriBilgisi: isim, soyisim\n"
     "- urunler: her biri isim, adet, birimFiyat, toplamFiyat\n"
     "- toplamTutar: (sadece sayı)"),
    ("human", "OCR Metni:\n{invoice_text}")
])


# ✅ OCR'dan metin çıkaran fonksiyon
async def extract_text_from_file(file: UploadFile) -> str:
    suffix = ".jpg" if file.filename.lower().endswith(('.jpg', '.jpeg')) else ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    return ocr_yap(tmp_path) or ""

# ✅ LLM ile JSON veriyi çıkaran fonksiyon (yeni API ile)
def parse_invoice_with_llm(text: str) -> dict:
    llm = OllamaLLM(model="llama3:8b", temperature=0)
    chain = invoice_extraction_prompt | llm

    raw_output = chain.invoke({"invoice_text": text})

    # Tüm JSON bloklarını yakala
    json_bloklari = re.findall(r'(\{[\s\S]*?\})', raw_output)

    if not json_bloklari:
        raise HTTPException(status_code=502, detail=f"Hiç JSON bloğu bulunamadı.\nÇıktı:\n{raw_output}")

    # Her JSON bloğunu sırayla parse et ve birleştir
    sonuc = {}
    for blok in json_bloklari:
        try:
            parcali = json.loads(blok)
            sonuc.update(parcali)
        except json.JSONDecodeError as e:
            raise HTTPException(status_code=502, detail=f"JSON parse hatası: {e.msg}\nHatalı parça:\n{blok}")

    return sonuc

# ✅ FastAPI endpoint
@app.post("/extract-invoice", response_class=JSONResponse)
async def extract_invoice(file: UploadFile = File(...)):
    text = await extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="OCR metni alınamadı veya boş.")
    parsed = parse_invoice_with_llm(text)
    return JSONResponse(content=parsed)
