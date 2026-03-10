from pydantic import BaseModel
from typing import List, Optional


class FarmerProfile(BaseModel):
    income: float
    land_size: float
    state: str
    crop: str
    irrigation: str
    farmer_type: str


class SchemeRecommendation(BaseModel):
    scheme_id: str
    scheme_name: str
    success_probability: float


class FarmerResponse(BaseModel):
    farmer_id: str
    message: str
    recommended_schemes: List[SchemeRecommendation]