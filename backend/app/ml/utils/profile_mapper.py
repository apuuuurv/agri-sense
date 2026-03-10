from app.ml.inference.crop_recommender import CropRecommender


crop_model = CropRecommender()


def map_farmer_to_ml_features(api_profile: dict) -> dict:
    """
    Convert FastAPI farmer schema into ML model features.
    """

    income = api_profile.get("annual_income", api_profile.get("income"))
    land_size = api_profile.get("land_size_hectares", api_profile.get("land_size"))
    irrigation = api_profile.get("irrigation_type", api_profile.get("irrigation"))

    # Use crop if provided
    crop = api_profile.get("crop")

    # If crop missing → use ML crop recommender
    if not crop:

        crop_features = {
            "temperature": api_profile.get("temperature", 25),
            "rainfall": api_profile.get("rainfall", 100),
            "nitrogen": api_profile.get("nitrogen", 50),
            "phosphorus": api_profile.get("phosphorus", 50),
            "potassium": api_profile.get("potassium", 50),
            "soil": api_profile.get("soil", "loamy"),
            "season": api_profile.get("season", "kharif"),
            "irrigation": irrigation
        }

        crop = crop_model.recommend_crop(crop_features)

    mapped_profile = {
        "income": income,
        "land_size": land_size,
        "state": str(api_profile.get("state", "")).lower(),
        "crop": str(crop).lower(),
        "irrigation": str(irrigation).lower(),
        "farmer_type": str(api_profile.get("farmer_type", "")).lower(),
        "scheme": "pm_kisan"  # overwritten during ranking
    }

    return mapped_profile