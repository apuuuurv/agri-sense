def clean_farmer_profile(profile: dict) -> dict:
    """
    Normalize incoming farmer profile data
    """

    cleaned = {}

    cleaned["income"] = float(profile.get("income", 0))
    cleaned["land_size"] = float(profile.get("land_size", 0))

    cleaned["state"] = str(profile.get("state", "")).strip().lower()
    cleaned["crop"] = str(profile.get("crop", "")).strip().lower()
    cleaned["irrigation"] = str(profile.get("irrigation", "")).strip().lower()
    cleaned["farmer_type"] = str(profile.get("farmer_type", "")).strip().lower()

    return cleaned