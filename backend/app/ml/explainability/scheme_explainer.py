class SchemeExplainer:
    """
    Generates explanations for scheme recommendations.
    """

    @staticmethod
    def explain(profile: dict, scheme_id: str):

        reasons = []

        income = profile.get("income", 0)
        land_size = profile.get("land_size", 0)
        farmer_type = profile.get("farmer_type", "")
        crop = profile.get("crop", "")

        if farmer_type == "small":
            reasons.append("Farmer belongs to small farmer category")

        if land_size <= 2:
            reasons.append("Land holding below 2 hectares")

        if income <= 200000:
            reasons.append("Income below ₹2 lakh")

        if crop == "cotton":
            reasons.append("Cotton crop eligible for support schemes")

        if len(reasons) == 0:
            reasons.append("General eligibility criteria satisfied")

        return reasons