import os
import pytesseract
from PIL import Image

# Tesseract yolunu sistemine göre ayarla (Windows için örnek aşağıda)
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'
os.environ['TESSDATA_PREFIX'] = r'C:\Program Files\Tesseract-OCR\tessdata'

def ocr_yap(image_path, dil='tur'):
    try:
        img = Image.open(image_path)
        return pytesseract.image_to_string(img, lang=dil)
    except Exception as e:
        return f"Hata oluştu: {e}"
