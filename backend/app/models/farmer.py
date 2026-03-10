from pydantic import BaseModel
from typing import List, Optional


class FarmerProfile(BaseModel):

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