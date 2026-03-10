from fastapi import APIRouter, HTTPException
from bson import ObjectId
from typing import List

from app.models.farmer import FarmerProfile, FarmerResponse
from app.ml.services.recommendation_service import RecommendationService
from app.core.database import get_db

router = APIRouter(prefix="/farmers", tags=["Farmers"])


# =========================
# Create Farmer
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

        return {
            "farmer_id": farmer_id,
            "message": "Farmer profile created successfully",
            "recommended_schemes": recommendations
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

    cursor = db["farmers"].find({})

    async for farmer in cursor:
        farmer["_id"] = str(farmer["_id"])
        farmers.append(farmer)

    return farmers