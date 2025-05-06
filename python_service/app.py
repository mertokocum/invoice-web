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

from langchain.prompts import ChatPromptTemplate

invoice_prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "You are an *invoice analysis tool*. Your task is to extract structured information from the provided OCR text "
     "and return it strictly in **valid and parsable JSON format**.\n\n"
     "⚠️ You must NOT include any explanations, text, markdown, tags, or descriptive comments—"
     "just the pure JSON object.\n\n"
     "Some fields might not be present in the OCR text. In such cases, follow these rules:\n"
     "- For missing text fields: return an empty string (`\"\"`),\n"
     "- For missing numeric fields: return `null`,\n"
     "- For missing list fields: return an empty list (`[]`).\n\n"
     "📦 Required JSON Schema and Example Output:\n"
     "```\n"
     "{{\n"
     "  \"storeInfo\": {{\n"
     "    \"name\": \"Migros A.S.\",\n"
     "    \"address\": \"Ataturk Ave. No:5, Istanbul\",\n"
     "    \"invoiceNumber\": \"F123456\",\n"
     "    \"date\": \"2024-05-01\",\n"
     "    \"email\": \"migros@gmail.com\",\n"
     "    \"storePhone\": \"0 (212) 563 25 47\"\n"
     "  }},\n"
     "  \"customerInfo\": {{\n"
     "    \"fullName\": \"Ahmet Sonuc\",\n"
     "    \"phone\": \"05321234567\",\n"
     "    \"email\": \"ahmet@example.com\",\n"
     "    \"taxNumber\": \"1234567890\"\n"
     "  }},\n"
     "  \"items\": [\n"
     "    {{\n"
     "      \"productName\": \"Milk 1L\",\n"
     "      \"productCode\": \"SUT001\",\n"
     "      \"quantity\": 2,\n"
     "      \"unitPrice\": 15.5,\n"
     "      \"lineTotal\": 31.0\n"
     "    }},\n"
     "    {{\n"
     "      \"productName\": \"Bread\",\n"
     "      \"productCode\": \"EKM001\",\n"
     "      \"quantity\": 1,\n"
     "      \"unitPrice\": 7.0,\n"
     "      \"lineTotal\": 7.0\n"
     "    }}\n"
     "  ],\n"
     "  \"paymentDetails\": {{\n"
     "    \"subtotal\": 38.0,\n"
     "    \"taxRate\": %20,\n"
     "    \"taxAmount\": 7.6,\n"
     "    \"totalAmount\": 45.6,\n"
     "    \"change\": 9.0\n"
     "  }}\n"
     "}}\n"
     "```"
    ),
    ("human", 
     "Below is the OCR-extracted text. Extract and return only the fields based on the schema above:\n\n"
     "OCR Text:\n{invoice_text}")
])




receipt_prompt = ChatPromptTemplate.from_messages([
    ("system", "Sen bir *fiş* analiz aracı olarak çalışıyorsun. "
               "Sadece geçerli JSON nesnesi dön. Başka hiçbir şey göndermeyeceksin."),
    ("human", "OCR Metni:\n{receipt_text}\n\n"
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
