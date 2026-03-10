def map_farmer_to_ml_features(api_profile: dict) -> dict:
    """
    Convert FastAPI farmer schema into ML model features.
    """

    income = api_profile.get("annual_income", api_profile.get("income"))
    land_size = api_profile.get("land_size_hectares", api_profile.get("land_size"))
    irrigation = api_profile.get("irrigation_type", api_profile.get("irrigation"))

    # Use crop from farmer input (safe fallback)
    crop = str(api_profile.get("crop", "wheat")).lower()

    mapped_profile = {
        "income": income,
        "land_size": land_size,
        "state": str(api_profile.get("state", "")).lower(),
        "crop": crop,
        "irrigation": str(irrigation).lower(),
        "farmer_type": str(api_profile.get("farmer_type", "")).lower(),
        "scheme": "pm_kisan"  # overwritten during ranking
    }

    return mapped_profile