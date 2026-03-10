# backend/app/api/upload.py
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import shutil
import os
import uuid
from app.core.security import get_current_user
from app.core.database import get_db
from bson import ObjectId

router = APIRouter()

# Ensure the uploads directory exists
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/")
async def upload_document(
    # Accept the file
    file: UploadFile = File(...),
    # Ask what type of document this is (e.g., 'aadhar', 'pan', 'land_receipt')
    doc_type: str = Form(..., description="Type of document, e.g., aadhar, pan, land_record"),
    # Ensure the user is logged in!
    current_user: dict = Depends(get_current_user)
):
    db = get_db()
    
    # 1. Validate file type
    allowed_types = ["application/pdf", "image/jpeg", "image/png", "image/jpg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Invalid file type. Only PDFs and Images allowed.")
    
    # 2. Generate a secure, unique filename
    file_extension = file.filename.split(".")[-1]
    unique_filename = f"{current_user['_id']}_{doc_type}_{uuid.uuid4().hex[:8]}.{file_extension}"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    # 3. Save the file to the local folder
    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Could not save file: {str(e)}")
        
    # 4. Run ML OCR Pipeline for verification
    ocr_data = {}
    try:
        from app.ml.ocr.document_pipeline import DocumentPipeline
        pipeline = DocumentPipeline()
        ocr_result = pipeline.process_document(file_path)
        ocr_data = ocr_result
        
        # If OCR successfully extracted an ID, we can optionally update the profile
        update_fields = {}
        if doc_type.lower() == 'aadhar' and ocr_result.get('aadhar'):
            update_fields['aadhar_number'] = ocr_result['aadhar']
        elif doc_type.lower() == 'pan' and ocr_result.get('pan'):
            update_fields['pan_number'] = ocr_result['pan']
            
        if update_fields:
            await db["farmers"].update_one(
                {"_id": ObjectId(current_user["_id"])},
                {"$set": update_fields}
            )
    except Exception as e:
        print(f"⚠️ OCR Processing Error: {str(e)}")
        ocr_data = {"error": "OCR processing failed", "details": str(e)}

    # 5. Update the Farmer's database record to include this new document!
    document_record = f"{doc_type}:{file_path}"
    
    await db["farmers"].update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$addToSet": {"documents_uploaded": document_record}} # addToSet prevents duplicates
    )
    
    return {
        "message": f"{doc_type} uploaded successfully",
        "filename": unique_filename,
        "status": "success"
    }