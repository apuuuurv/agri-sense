import pytesseract
import cv2
from PIL import Image


class OCREngine:

    def preprocess_image(self, image_path):

        image = cv2.imread(image_path)

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

        # noise removal
        gray = cv2.medianBlur(gray, 3)

        # thresholding
        thresh = cv2.adaptiveThreshold(
            gray,
            255,
            cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY,
            11,
            2
        )

        return thresh

    def extract_text(self, image_path: str):

        processed = self.preprocess_image(image_path)

        text = pytesseract.image_to_string(processed)

        return text