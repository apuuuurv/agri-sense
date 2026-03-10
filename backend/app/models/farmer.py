# backend/app/models/farmer.py
from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List

class FarmerProfile(BaseModel):
    # Basic Info
    full_name: str = Field(..., example="Ramesh Kumar")
    age: int = Field(..., ge=18)
    gender: str = Field(..., example="Male")
    category: str = Field(..., example="OBC", description="General, SC, ST, OBC")
    is_differently_abled: bool = Field(default=False)
    highest_qualification: str = Field(..., example="10th Pass", description="None, 10th Pass, 12th Pass, Graduate")
    
    # Contact & Location
    phone_number: str = Field(..., example="+919876543210")
    email: Optional[EmailStr] = Field(None, example="ramesh@example.com")
    state: str = Field(..., example="Maharashtra")
    district: str = Field(..., example="Pune")
    pincode: str = Field(..., example="411001")
    
    # Identity & Financial (For Document Verification)
    aadhar_number: Optional[str] = Field(None, example="123456789012")
    pan_number: Optional[str] = Field(None, example="ABCDE1234F")
    annual_income: float = Field(..., example=60000.0)
    bank_account_linked: bool = Field(default=True, description="Is bank account linked with Aadhar?")
    
    # Agricultural Data
    land_size_hectares: float = Field(..., example=1.5)
    farmer_type: str = Field(..., example="Small", description="Landless, Marginal (<1Ha), Small (1-2Ha), Large (>2Ha)")
    irrigation_type: str = Field(..., example="Rainfed", description="Rainfed, Irrigated, Partially Irrigated")
    primary_crops: List[str] = Field(default=[], example=["Wheat", "Cotton"])
    
    # Document Tracking (We will update these paths when they upload files)
    documents_uploaded: List[str] = Field(default=[], description="List of document types uploaded e.g., ['aadhar', 'land_record']")

class FarmerDB(FarmerProfile):
    # This is how it looks in the database (with password and ID)
    hashed_password: str
    
class FarmerResponse(FarmerProfile):
    # This is what we send back to the frontend (HIDING the password)
    id: str = Field(..., alias="_id")