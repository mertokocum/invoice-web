import os
import cv2
import pytesseract
from PIL import Image

# Tesseract ayarları (Windows için yolunu doğru ayarla)
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

def preprocess_image(image_path):
    img = cv2.imread(image_path)

    # Griye çevir
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

    # Gürültü azalt
    blur = cv2.medianBlur(gray, 3)

    # Adaptif threshold (arka plan temizliği için)
    thresh = cv2.adaptiveThreshold(blur, 255,
                                   cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                   cv2.THRESH_BINARY, 31, 2)

    # Görüntüyü büyüt (küçük yazıları daha iyi tanımak için)
    resized = cv2.resize(thresh, None, fx=1.5, fy=1.5, interpolation=cv2.INTER_LINEAR)

    # Geçici olarak kaydet
    temp_path = "temp_preprocessed.png"
    cv2.imwrite(temp_path, resized)
    return temp_path

def ocr_yap(image_path, dil="tur+eng"):
    try:
        preprocessed_path = preprocess_image(image_path)
        img = Image.open(preprocessed_path)

        # Tesseract gelişmiş ayarları
        config = r"--oem 3 --psm 6"
        text = pytesseract.image_to_string(img, lang=dil, config=config)

        # OCR çıktısını konsola yazdır
        print("=" * 40)
        print("📄 OCR ÇIKTISI")
        print("=" * 40)
        print(text)
        print("=" * 40)

        # Geçici dosyayı sil
        if os.path.exists(preprocessed_path):
            os.remove(preprocessed_path)

        return text
    except Exception as e:
        print(f"Hata oluştu: {e}")
        return f"Hata oluştu: {e}"

# Test için:
if __name__ == "__main__":
    path = "ornek_fatura.png"
    sonuc = ocr_yap(path)
    print("OCR Sonucu:\n", sonuc)
