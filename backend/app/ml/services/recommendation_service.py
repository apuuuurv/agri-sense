from app.ml.inference.ranking_engine import SchemeRankingEngine


class RecommendationService:
    """
    Service layer responsible for generating
    scheme recommendations using ML ranking engine.
    """

    ranking_engine = SchemeRankingEngine()

    @staticmethod
    def get_recommendations(farmer_profile: dict):

        results = RecommendationService.ranking_engine.rank_schemes(
            farmer_profile
        )

        # ranking_engine returns a dictionary
        # we extract only the ranked list for the API
        return results["ranked_schemes"]