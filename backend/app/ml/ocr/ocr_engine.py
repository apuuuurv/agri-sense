import pytesseract
import cv2
import numpy as np
pytesseract.pytesseract.tesseract_cmd = r"C:\Program Files\Tesseract-OCR\tesseract.exe"

class OCREngine:

    def preprocess_image(self, image_path):

        image = cv2.imread(image_path)

        if image is None:
            raise ValueError(f"Image not found: {image_path}")

        # resize for better OCR
        image = cv2.resize(image, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)

        # convert to grayscale
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # remove noise
        gray = cv2.bilateralFilter(gray, 9, 75, 75)

        # threshold
        _, thresh = cv2.threshold(gray, 150, 255, cv2.THRESH_BINARY)

        return thresh


    def extract_text(self, image_path: str):

        processed = self.preprocess_image(image_path)

        # Tesseract configuration
        custom_config = r'--oem 3 --psm 6'

        text = pytesseract.image_to_string(processed, config=custom_config)

        return text