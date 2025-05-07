import os
import cv2
import pytesseract
import numpy as np
from PIL import Image
from pytesseract import Output

# ✅ Tesseract ayarları
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"
os.environ["TESSDATA_PREFIX"] = r"C:\Program Files\Tesseract-OCR\tessdata"

# 1️⃣ DPI arttırma
def set_image_dpi(img, scale_factor=6):
    height, width = img.shape[:2]
    new_height = int(height * scale_factor)
    new_width = int(width * scale_factor)
    return cv2.resize(img, (new_width, new_height))

# 2️⃣ Normalizasyon
def normalize_image(img):
    norm_img = np.zeros(img.shape)
    return cv2.normalize(img, norm_img, 0, 255, cv2.NORM_MINMAX)

# 3️⃣ Gürültü azaltma (hafifletildi)
def remove_noise(img):
    return cv2.fastNlMeansDenoisingColored(img, None, 3, 3, 7, 15)

# 4️⃣ Gri tonlama
def get_grayscale(img):
    return cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)

# 5️⃣ Threshold (adaptive yerine Otsu threshold iyi sonuç verdi)
def thresholding(img):
    return cv2.threshold(img, 150, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)[1]

# 🔧 Preprocessing pipeline (ters kontrast kaldırıldı)
def preprocess_image(image_path):
    img = cv2.imread(image_path)
    img = set_image_dpi(img)
    img = normalize_image(img)
    img = remove_noise(img)
    img = get_grayscale(img)
    img = thresholding(img)
    # img = invert(img)  # Ters kontrast devre dışı

    temp_path = "temp_preprocessed.png"
    cv2.imwrite(temp_path, img)
    return temp_path

# 🔍 OCR işlemi
def ocr_yap(image_path, dil="tur+eng"):
    try:
        preprocessed_path = preprocess_image(image_path)
        img = cv2.imread(preprocessed_path)

        # 🧠 PSM 4: Sayfa düzeyinde yapı (fiş için en uygun modlardan biri)
        config = r"--oem 3 --psm 4"

        # ✅ Ana OCR işlemi
        raw_text = pytesseract.image_to_string(img, lang=dil, config=config)

        # 🔚 Temizlik
        if os.path.exists(preprocessed_path):
            os.remove(preprocessed_path)

        return raw_text.strip()
    except Exception as e:
        print(f"Hata oluştu: {e}")
        return ""

# 🚀 Test modu
if __name__ == "__main__":
    path = "ornek_fatura.png"  # 📸 Görsel dosya yolu
    sonuc = ocr_yap(path)
    print("\n✅ OCR Sonucu:\n" + "="*40)
    print(sonuc)
    print("="*40)
