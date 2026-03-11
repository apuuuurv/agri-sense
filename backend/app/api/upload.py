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
        
    # 4. Run ML OCR Pipeline for verification (Non-blocking)
    ocr_data = {}
    is_verified = False # Default to false for DB marking, but we'll tell frontend it's "OK" to proceed
    extracted_id = None

    try:
        from app.ml.ocr.document_pipeline import DocumentPipeline
        pipeline = DocumentPipeline()
        ocr_result = pipeline.process_document(file_path, doc_type)
        ocr_data = ocr_result
        
        # We still try to extract data for convenience, but we don't block
        if ocr_result.get('is_verified'):
            is_verified = True
            extracted_id = ocr_result.get('extracted_id')
            
            update_fields = {}
            if doc_type.lower() == 'aadhar':
                update_fields['aadhar_number'] = extracted_id
                update_fields['is_aadhar_verified'] = True
            elif doc_type.lower() == 'pan':
                update_fields['pan_number'] = extracted_id
                update_fields['is_pan_verified'] = True
                
            if update_fields:
                await db["farmers"].update_one(
                    {"_id": ObjectId(current_user["_id"])},
                    {"$set": update_fields}
                )
        else:
            # Even if V2 says not verified, we log it and continue
            ocr_data["warning"] = ocr_result.get("error", "OCR did not perfectly match document type")
            
    except Exception as e:
        print(f"⚠️ OCR Processing Log: {str(e)}")
        ocr_data = {"info": "OCR skipped or failed", "details": str(e)}

    # 5. Always allow the UI to consider this a "success" for the workflow
    # We'll treat every successful upload as a green light for the frontend wizard
    frontend_satisfied = True 

    # 5. Update the Farmer's database record to include this new document!
    document_record = f"{doc_type}:{file_path}"
    
    await db["farmers"].update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$addToSet": {"documents_uploaded": document_record}} # addToSet prevents duplicates
    )
    
    # 6. Prepare response with verification status
    is_verified = False
    extracted_id = None
    if doc_type.lower() == 'aadhar' and ocr_data.get('aadhar'):
        is_verified = True
        extracted_id = ocr_data['aadhar']
    elif doc_type.lower() == 'pan' and ocr_data.get('pan'):
        is_verified = True
        extracted_id = ocr_data['pan']

    return {
        "message": f"{doc_type} uploaded successfully",
        "filename": unique_filename,
        "status": "success",
        "is_verified": is_verified,
        "extracted_id": extracted_id,
        "ocr_details": ocr_data
    }