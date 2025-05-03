import os
import shutil
import json
import re
import tempfile
from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.responses import JSONResponse
from langchain.prompts import ChatPromptTemplate
from langchain_community.llms import Ollama
from langchain.chains import LLMChain
from ocr import ocr_yap

app = FastAPI(title="Invoice OCR Extraction API")

invoice_extraction_prompt = ChatPromptTemplate.from_messages([
    ("system",
     "Sen bir fatura/fiş analiz aracı olarak çalışıyorsun. "
     "Sadece geçerli JSON nesnesi dön. Başka hiçbir şey göndermeyeceksin—ne metin, ne açıklama, ne markdown, sadece saf JSON."),
    ("human",
     "OCR Metni:\n{invoice_text}\n\n"
     "Çıkarılması gereken alanlar: "
     "magazaBilgisi (unvan, adres, fisNumarasi, tarih), "
     "musteriBilgisi (isim, soyisim, telfon, email, vergino), "
     "urunKalemleri (liste; her kalem: urunAdi, urunKodu, miktar, birimFiyat, satirToplam), "
     "odemeBilgileri (araToplam, vergiOrani, vergiTutari, yuvarlama, genelToplam, odenenTutar, paraUstu).")
])

async def extract_text_from_file(file: UploadFile) -> str:
    suffix = ".jpg" if file.filename.lower().endswith(('.jpg', '.jpeg')) else ".png"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name
    return ocr_yap(tmp_path) or ""

def parse_invoice_with_llm(text: str) -> dict:
    llm = Ollama(model="llama2:7b", temperature=0)
    chain = LLMChain(llm=llm, prompt=invoice_extraction_prompt)

    raw_output = chain.predict(invoice_text=text)
    obj_match = re.search(r'(\{[\s\S]*\})', raw_output)
    if not obj_match:
        raise HTTPException(status_code=502, detail=f"JSON ayrıştırılamadı. Çıktı:\n{raw_output}")

    json_str = obj_match.group(1)
    try:
        return json.loads(json_str)
    except json.JSONDecodeError as e:
        raise HTTPException(status_code=502, detail=f"JSON parse hatası: {e.msg}\n{json_str}")

@app.post("/extract-invoice", response_class=JSONResponse)
async def extract_invoice(file: UploadFile = File(...)):
    text = await extract_text_from_file(file)
    if not text.strip():
        raise HTTPException(status_code=400, detail="OCR metni alınamadı veya boş.")
    parsed = parse_invoice_with_llm(text)
    return JSONResponse(content=parsed)
