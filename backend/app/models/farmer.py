from pydantic import BaseModel
from typing import List, Optional


class FarmerProfile(BaseModel):
<<<<<<< HEAD
    # Basic Info (Required immediately)
    full_name: str = Field(..., example="Ramesh Kumar")
    email: EmailStr = Field(..., example="ramesh@example.com")
    
    # Everything below is Optional (Filled out later!)
    phone_number: Optional[str] = Field(None, example="+919876543210")
    age: Optional[int] = Field(None, ge=18)
    gender: Optional[str] = Field(None, example="Male")
    category: Optional[str] = Field(None, example="OBC")
    is_differently_abled: Optional[bool] = Field(default=False)
    highest_qualification: Optional[str] = Field(None, example="10th Pass")
    
    # Contact & Location
    state: Optional[str] = Field(None, example="Maharashtra")
    district: Optional[str] = Field(None, example="Pune")
    pincode: Optional[str] = Field(None, example="411001")
    
    # Identity & Financial
    aadhar_number: Optional[str] = Field(None, example="123456789012")
    pan_number: Optional[str] = Field(None, example="ABCDE1234F")
    annual_income: Optional[float] = Field(None, example=60000.0)
    bank_account_linked: Optional[bool] = Field(default=False)
    
    # Agricultural Data
    land_size_hectares: Optional[float] = Field(None, example=1.5)
    farmer_type: Optional[str] = Field(None, example="Small")
    irrigation_type: Optional[str] = Field(None, example="Rainfed")
    primary_crops: List[str] = Field(default=[])
    
    documents_uploaded: List[str] = Field(default=[])

class FarmerDB(FarmerProfile):
    hashed_password: str
    
class FarmerResponse(FarmerProfile):
    id: str = Field(..., alias="_id")

# --- NEW AUTH MODELS ---

class FarmerSignup(BaseModel):
    # Strictly just the essentials for creating an account
    full_name: str = Field(..., example="Ramesh Kumar")
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., example="SecurePassword123!")

class Token(BaseModel):
    access_token: str
    token_type: str
=======

    income: float
    land_size: float
    state: str
    irrigation: str
    farmer_type: str

    crop: Optional[str] = None
    temperature: Optional[float] = None
    rainfall: Optional[float] = None
    soil: Optional[str] = None
    season: Optional[str] = None

from typing import List

class SchemeRecommendation(BaseModel):
    scheme_id: str
    scheme_name: str
    success_probability: float
    explanation: List[str] = []

class FarmerResponse(BaseModel):
    farmer_id: str
    message: str
    recommended_schemes: List[SchemeRecommendation]
>>>>>>> Gaurav-ML
