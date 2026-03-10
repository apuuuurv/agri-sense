from app.ml.ocr.ocr_engine import OCREngine
from app.ml.ocr.document_parser import DocumentParser


class DocumentPipeline:

    def __init__(self):

        self.ocr = OCREngine()
        self.parser = DocumentParser()

    def process_document(self, image_path: str):

        text = self.ocr.extract_text(image_path)

        aadhar = self.parser.extract_aadhar(text)
        pan = self.parser.extract_pan(text)

        return {
            "aadhar": aadhar,
            "pan": pan,
            "raw_text": text[:500]
        }