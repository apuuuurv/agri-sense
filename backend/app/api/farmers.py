from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List

from app.models.farmer import FarmerProfile, FarmerResponse
from app.ml.services.recommendation_service import RecommendationService
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter(tags=["Farmers"])

@router.get("/me", response_model=FarmerResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """
    Fetch the profile of the currently logged-in farmer.
    """
    db = get_db()
    farmer = await db["farmers"].find_one({"_id": ObjectId(current_user["_id"])})
    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")
    
    farmer["_id"] = str(farmer["_id"])
    
    # Generate AI recommendations on the fly
    try:
        recommendations = RecommendationService.get_recommendations(farmer)
        farmer["recommended_schemes"] = recommendations
    except Exception as e:
        print(f"⚠️f Recommendation Error: {str(e)}")
        farmer["recommended_schemes"] = []
        
    return farmer

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
    
    if update_data:
        await db["farmers"].update_one(
            {"_id": ObjectId(current_user["_id"])}, 
            {"$set": update_data}
        )
    
    updated_farmer = await db["farmers"].find_one({"_id": ObjectId(current_user["_id"])})
    updated_farmer["_id"] = str(updated_farmer["_id"])
    
    # Generate AI recommendations after update
    try:
        recommendations = RecommendationService.get_recommendations(updated_farmer)
        print(f"📊 Profile Update: Found {len(recommendations)} eligible schemes for {updated_farmer['full_name']}")
        updated_farmer["recommended_schemes"] = recommendations
    except Exception as e:
        print(f"⚠️ Recommendation Error: {str(e)}")
        updated_farmer["recommended_schemes"] = []
        
    return updated_farmer

# =========================
# Create Farmer (Legacy/Internal)
# =========================
@router.post("/", response_model=FarmerResponse, status_code=201)
async def create_farmer(farmer: FarmerProfile):
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    farmer_dict = farmer.model_dump()
    try:
        # Store farmer profile
        result = await db["farmers"].insert_one(farmer_dict)
        farmer_id = str(result.inserted_id)

        # Generate AI recommendations
        recommendations = RecommendationService.get_recommendations(farmer_dict)
        
        farmer_dict["_id"] = farmer_id
        farmer_dict["recommended_schemes"] = recommendations
        return farmer_dict

    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# =========================
# Get Farmer by ID
# =========================
@router.get("/{farmer_id}", response_model=FarmerResponse)
async def get_farmer(farmer_id: str):
    db = get_db()
    try:
        farmer = await db["farmers"].find_one({"_id": ObjectId(farmer_id)})
    except:
        raise HTTPException(status_code=400, detail="Invalid Farmer ID")

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer["_id"] = str(farmer["_id"])
    
    # Generate AI recommendations
    try:
        recommendations = RecommendationService.get_recommendations(farmer)
        farmer["recommended_schemes"] = recommendations
    except Exception as e:
        farmer["recommended_schemes"] = []

    return farmer

# =========================
# Get All Farmers
# =========================
@router.get("/", response_model=List[FarmerResponse])
async def get_all_farmers():
    db = get_db()
    farmers = []
    cursor = db["farmers"].find({})
    async for farmer in cursor:
        farmer["_id"] = str(farmer["_id"])
        # We don't generate recommendations for all in the list view for performance
        farmers.append(farmer)
    return farmers
