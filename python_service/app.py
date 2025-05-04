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
from langchain.prompts import ChatPromptTemplate

invoice_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "Sen bir *fatura analiz aracı* olarak çalışıyorsun. Görevin, verilen OCR metninden yapılandırılmış bilgileri "
     "yalnızca **geçerli ve pars edilebilir bir JSON** formatında çıkarmaktır. "
     "Hiçbir açıklama, metin, markdown, etiket ya da açıklayıcı ifade kullanmayacaksın—"
     "sadece saf JSON nesnesi döneceksin.\n\n"

     "Alanlardan bazıları OCR metninde yer almayabilir. Bu durumda ilgili alanları:\n"
     "- metinsel alanlar için boş string (`\"\"`),\n"
     "- sayısal alanlar için `null`,\n"
     "- liste alanları için `[]` olarak döndürmelisin.\n\n"

     "📦 JSON Şeması ve Örnek:\n"
     "```\n"
     "{{\n"
     "  \"magazaBilgisi\": {{\n"
     "    \"unvan\": \"Migros A.Ş.\",\n"
     "    \"adres\": \"Atatürk Cad. No:5, İstanbul\",\n"
     "    \"fisNumarasi\": \"F123456\",\n"
     "    \"tarih\": \"2024-05-01\"\n"
     "  }},\n"
     "  \"musteriBilgisi\": {{\n"
     "    \"isim\": \"Ahmet\",\n"
     "    \"soyisim\": \"Yılmaz\",\n"
     "    \"telefon\": \"05321234567\",\n"
     "    \"email\": \"ahmet@example.com\",\n"
     "    \"vergino\": \"1234567890\"\n"
     "  }},\n"
     "  \"urunKalemleri\": [\n"
     "    {{\n"
     "      \"urunAdi\": \"Süt 1L\",\n"
     "      \"urunKodu\": \"SUT001\",\n"
     "      \"miktar\": 2,\n"
     "      \"birimFiyat\": 15.5,\n"
     "      \"satirToplam\": 31.0\n"
     "    }},\n"
     "    {{\n"
     "      \"urunAdi\": \"Ekmek\",\n"
     "      \"urunKodu\": \"EKM001\",\n"
     "      \"miktar\": 1,\n"
     "      \"birimFiyat\": 7.0,\n"
     "      \"satirToplam\": 7.0\n"
     "    }}\n"
     "  ],\n"
     "  \"odemeBilgileri\": {{\n"
     "    \"araToplam\": 38.0,\n"
     "    \"vergiOrani\": 0.08,\n"
     "    \"vergiTutari\": 3.04,\n"
     "    \"yuvarlama\": -0.04,\n"
     "    \"genelToplam\": 41.0,\n"
     "    \"odenenTutar\": 50.0,\n"
     "    \"paraUstu\": 9.0\n"
     "  }}\n"
     "}}\n"
     "```"
    ),
    ("human", 
     "OCR ile elde edilen metin aşağıdadır. Bu metinden yukarıdaki şemaya göre alanları çıkar:\n\n"
     "OCR Metni:\n{invoice_text}")
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
    input_key = "invoice_text" if doc_type == "fatura" else "receipt_text"
    
    llm = OllamaLLM(model=model, temperature=0)
    chain = prompt | llm
    raw_output = chain.invoke({input_key: text})

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
