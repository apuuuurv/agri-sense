# backend/app/models/farmer.py
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional


# ─────────────────────────────────────────────
#  Core Farmer Profile (used by profile wizard)
# ─────────────────────────────────────────────
class FarmerProfile(BaseModel):

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
    preferred_language: str = Field(default="en", description="User's preferred UI language")

    documents_uploaded: List[str] = Field(default=[])


class FarmerDB(FarmerProfile):
    hashed_password: str


# ─────────────────────────────────────────────
#  Auth Models
# ─────────────────────────────────────────────
class FarmerSignup(BaseModel):
    """Strictly just the essentials for creating an account."""
    full_name: str = Field(..., example="Ramesh Kumar")
    email: EmailStr = Field(..., example="ramesh@example.com")
    password: str = Field(..., example="SecurePassword123!")


class FarmerResponse(FarmerProfile):
    """Returned after signup / profile fetch. Maps MongoDB _id → id."""
    id: str = Field(..., alias="_id")

    class Config:
        populate_by_name = True


class Token(BaseModel):
    access_token: str
    token_type: str


# ─────────────────────────────────────────────
#  Scheme Recommendation Models
# ─────────────────────────────────────────────
class SchemeRecommendation(BaseModel):
    scheme_id: str
    scheme_name: str
    success_probability: float
    explanation: List[str] = []


class SchemeRecommendationResponse(BaseModel):
    """Response returned by the scheme recommendation engine."""
    farmer_id: str
    message: str
    recommended_schemes: List[SchemeRecommendation]
