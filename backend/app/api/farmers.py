# backend/app/api/farmers.py
from fastapi import APIRouter, HTTPException
from app.models.farmer import FarmerProfile, FarmerResponse
from app.core.database import get_db

# Create a router for all farmer-related endpoints
router = APIRouter()

@router.post("/", response_model=FarmerResponse, status_code=201)
async def create_farmer(farmer: FarmerProfile):
    # Get the database connection
    db = get_db()
    if db is None:
        raise HTTPException(status_code=500, detail="Database not connected")

    # Convert the Pydantic model into a Python dictionary
    farmer_dict = farmer.model_dump()

    # Insert the data into the 'farmers' collection
    result = await db["farmers"].insert_one(farmer_dict)

    # Fetch the newly created document from the database
    created_farmer = await db["farmers"].find_one({"_id": result.inserted_id})

    # MongoDB uses a special ObjectId type for _id. 
    # We need to convert it to a normal string so Pydantic and our frontend can read it.
    created_farmer["_id"] = str(created_farmer["_id"])

    return created_farmer

@router.get("/", response_model=list[FarmerResponse])
async def get_all_farmers():
    db = get_db()
    farmers = []
    
    # Fetch all farmers from the collection
    cursor = db["farmers"].find({})
    async for document in cursor:
        document["_id"] = str(document["_id"])
        farmers.append(document)
        
    return farmers