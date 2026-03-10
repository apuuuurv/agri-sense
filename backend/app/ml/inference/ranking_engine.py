from pathlib import Path

from app.ml.explainability.scheme_explainer import SchemeExplainer
from app.ml.reinforcement.policy_engine import SchemePolicy
from app.ml.reinforcement.interaction_logger import log_interaction
from app.ml.rules.rules_engine import RulesEngine
from app.ml.inference.success_predictor import SchemeSuccessPredictor
from app.ml.utils.profile_mapper import map_farmer_to_ml_features
from app.ml.utils.logger import get_logger
from app.ml.features.feature_store import FeatureStore


logger = get_logger(__name__)

BASE_DIR = Path(__file__).resolve().parent.parent
RULES_PATH = BASE_DIR / "rules" / "schemes_rules.yaml"


class SchemeRankingEngine:
    """
    Ranking engine responsible for generating ranked scheme
    recommendations using rule filtering + ML probability scoring
    + reinforcement learning selection.
    """

    def __init__(self):

        logger.info("Initializing Scheme Ranking Engine")

        self.rule_engine = RulesEngine(RULES_PATH)
        self.ml_model = SchemeSuccessPredictor()
        self.feature_store = FeatureStore()

        # Reinforcement learning policy
        self.policy = SchemePolicy()

    def rank_schemes(self, farmer_profile: dict):

        logger.info("Building ML features from farmer profile")

        # Step 1 — Clean + normalize profile
        features = self.feature_store.build_features(farmer_profile)

        logger.info("Running scheme eligibility rules")

        # Step 2 — Filter eligible schemes
        eligible_schemes = self.rule_engine.filter_schemes(features)

        logger.info(f"Eligible schemes found: {len(eligible_schemes)}")

        ranked_results = []

        # Step 3 — Prepare ML base features ONCE
        base_ml_features = map_farmer_to_ml_features(features)

        # Step 4 — Score each scheme
        for scheme in eligible_schemes:

            scheme_id = scheme.get("scheme_id")

            # Copy base features
            ml_features = base_ml_features.copy()

            # Inject scheme feature
            ml_features["scheme"] = scheme_id.lower()

            # Predict success probability
            probability = self.ml_model.predict_success(ml_features)

            # Generate explanation
            explanation = SchemeExplainer.explain(features, scheme_id)

            ranked_results.append({
                "scheme_id": scheme_id,
                "scheme_name": scheme.get("name"),
                "success_probability": probability,
                "explanation": explanation
            })

        # Step 5 — Sort by probability
        ranked_results.sort(
            key=lambda x: x["success_probability"],
            reverse=True
        )

        logger.info("Scheme ranking completed")

        # Step 6 — Reinforcement policy selects best scheme
        scheme_ids = [s["scheme_id"] for s in ranked_results]

        selected_scheme = None

        if scheme_ids:
            selected_scheme = self.policy.select_scheme(scheme_ids)

        return {
            "ranked_schemes": ranked_results,
            "recommended_scheme": selected_scheme
        }

    def log_feedback(self, profile: dict, scheme: str, reward: int):
        """
        Log reinforcement learning feedback.

        reward:
        1 = scheme worked
        0 = scheme failed
        """

        log_interaction(profile, scheme, reward)