# backend/app/api/farmers.py
from fastapi import APIRouter, HTTPException, Depends
from bson import ObjectId
from typing import List

from app.models.farmer import FarmerProfile, FarmerResponse, SchemeRecommendationResponse
from app.ml.services.recommendation_service import RecommendationService
from app.core.database import get_db
from app.core.security import get_current_user

router = APIRouter()


# =========================
# Get My Profile (Auth)
# =========================
@router.get("/me", response_model=FarmerResponse)
async def get_my_profile(current_user: dict = Depends(get_current_user)):
    """Fetch the profile of the currently logged-in farmer."""
    return current_user


# =========================
# Update My Profile (Auth)
# =========================
@router.put("/me", response_model=FarmerResponse)
async def update_my_profile(
    profile_data: FarmerProfile,
    current_user: dict = Depends(get_current_user),
):
    """Complete or edit the profile of the currently logged-in farmer."""
    db = get_db()

    # exclude_unset=True means it will ONLY update the fields the user actually sends
    update_data = profile_data.model_dump(exclude_unset=True)

    # Prevent updating email or password through this route
    update_data.pop("email", None)
    update_data.pop("hashed_password", None)

    if not update_data:
        return current_user  # Nothing to update

    await db["farmers"].update_one(
        {"_id": ObjectId(current_user["_id"])},
        {"$set": update_data},
    )

    updated_farmer = await db["farmers"].find_one({"_id": ObjectId(current_user["_id"])})
    updated_farmer["_id"] = str(updated_farmer["_id"])

    return updated_farmer


# =========================
# Create Farmer (Public)
# =========================
@router.post("/", response_model=SchemeRecommendationResponse, status_code=201)
async def create_farmer(farmer: FarmerProfile):
    db = get_db()

    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    farmer_dict = farmer.model_dump()

    try:
        result = await db["farmers"].insert_one(farmer_dict)
        farmer_id = str(result.inserted_id)

        # Generate AI recommendations
        recommendations = RecommendationService.get_recommendations(farmer_dict)

        return {
            "farmer_id": farmer_id,
            "message": "Farmer profile created successfully",
            "recommended_schemes": recommendations,
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# =========================
# Get Farmer by ID
# =========================
@router.get("/{farmer_id}")
async def get_farmer(farmer_id: str):
    db = get_db()

    farmer = await db["farmers"].find_one({"_id": ObjectId(farmer_id)})

    if not farmer:
        raise HTTPException(status_code=404, detail="Farmer not found")

    farmer["_id"] = str(farmer["_id"])
    return farmer


# =========================
# Get All Farmers
# =========================
@router.get("/", response_model=List[dict])
async def get_all_farmers():
    db = get_db()

    farmers = []
    async for farmer in db["farmers"].find({}):
        farmer["_id"] = str(farmer["_id"])
        farmers.append(farmer)

    return farmers