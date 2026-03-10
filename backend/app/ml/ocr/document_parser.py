import re


class DocumentParser:

    def extract_aadhar(self, text: str):

        # remove unwanted characters
        cleaned_text = re.sub(r"[^\d\s]", "", text)

        # find Aadhaar pattern
        match = re.search(r"\b\d{4}\s?\d{4}\s?\d{4}\b", cleaned_text)

        return match.group() if match else None


    def extract_pan(self, text: str):

        match = re.search(r"[A-Z]{5}[0-9]{4}[A-Z]", text)

        return match.group() if match else None