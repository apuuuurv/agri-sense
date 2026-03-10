# backend/app/api/farmers.py
from fastapi import APIRouter, HTTPException, Depends
from app.models.farmer import FarmerProfile, FarmerResponse
from app.core.database import get_db
from app.core.security import get_current_user
from bson import ObjectId

router = APIRouter()

@router.get("/me", response_model=FarmerResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetch the profile of the currently logged-in farmer.
    """
    return current_user

@router.put("/me", response_model=FarmerResponse)
async def update_my_profile(profile_data: FarmerProfile, current_user: dict = Depends(get_current_user)):
    """
    Complete or edit the profile of the currently logged-in farmer.
    """
    db = get_db()
    
    # exclude_unset=True means it will ONLY update the fields the user actually sends in the request
    update_data = profile_data.model_dump(exclude_unset=True)
    
    # Prevent updating the email or password through this route for security
    update_data.pop("email", None) 
    update_data.pop("hashed_password", None)
    
    if not update_data:
        return current_user # Nothing to update
        
    await db["farmers"].update_one(
        {"_id": ObjectId(current_user["_id"])}, 
        {"$set": update_data}
    )
    
    updated_farmer = await db["farmers"].find_one({"_id": ObjectId(current_user["_id"])})
    updated_farmer["_id"] = str(updated_farmer["_id"])
    
    return updated_farmer

# (Optional: You can keep the generic get_all_farmers route for an admin dashboard later)
@router.get("/", response_model=list[FarmerResponse])
async def get_all_farmers():
    db = get_db()
    farmers = await db["farmers"].find().to_list(100)
    for f in farmers:
        f["_id"] = str(f["_id"])
    return farmers