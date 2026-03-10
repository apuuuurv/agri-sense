"""
Rule Engine for scheme eligibility filtering.

Evaluates farmer profiles against scheme rules defined in YAML.
"""

import yaml
from typing import List, Dict, Any


class RulesEngine:
    """
    Rule-based engine that filters schemes based on eligibility conditions.
    """

    def __init__(self, rules_path: str):
        self.rules_path = rules_path
        self.schemes = self.load_rules()

        # Supported operators
        self.operators = {
            "==": lambda a, b: a == b,
            "!=": lambda a, b: a != b,
            "<": lambda a, b: float(a) < float(b),
            "<=": lambda a, b: float(a) <= float(b),
            ">": lambda a, b: float(a) > float(b),
            ">=": lambda a, b: float(a) >= float(b),
            "in": lambda a, b: a in b if isinstance(b, list) else False,
            "not_in": lambda a, b: a not in b if isinstance(b, list) else False,
        }

    def load_rules(self) -> List[Dict]:
        """
        Load scheme rules from YAML file.
        """
        try:
            with open(self.rules_path, "r", encoding="utf-8") as file:
                data = yaml.safe_load(file)
                return data.get("schemes", [])
        except Exception as e:
            print(f"Error loading rules: {e}")
            return []

    def normalize(self, value):
        """
        Normalize values for comparison.
        """
        if isinstance(value, str):
            return value.strip().lower()
        return value

    def evaluate_rule(self, farmer_value, operator, rule_value) -> bool:
        """
        Evaluate a single rule condition.
        """

        farmer_value = self.normalize(farmer_value)
        rule_value = self.normalize(rule_value)

        op_func = self.operators.get(operator)

        if not op_func:
            print(f"Unsupported operator: {operator}")
            return False

        try:
            return op_func(farmer_value, rule_value)
        except Exception:
            return False

    def check_scheme(self, scheme: Dict, farmer_profile: Dict) -> bool:
        """
        Check if farmer satisfies all scheme rules.
        """

        rules = scheme.get("rules", [])

        for rule in rules:
            field = rule.get("field")
            operator = rule.get("operator")
            value = rule.get("value")

            farmer_value = farmer_profile.get(field)

            # If profile does not contain the required field
            if farmer_value is None:
                return False

            if not self.evaluate_rule(farmer_value, operator, value):
                return False

        return True

    def filter_schemes(self, farmer_profile: Dict) -> List[Dict]:
        """
        Return list of schemes farmer is eligible for.
        """

        eligible_schemes = []

        for scheme in self.schemes:
            if self.check_scheme(scheme, farmer_profile):
                eligible_schemes.append(scheme)

        return eligible_schemes