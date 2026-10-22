import unittest
from agent_lab.core import evaluate, ROLES

CASE = "An AI assistant drafts scheduling replies for staff approval."

class GovernanceTests(unittest.TestCase):
    def test_all_controls(self):
        review = evaluate(CASE, dict.fromkeys(("human_approval", "audit_log", "least_privilege", "bounded_execution"), True))
        self.assertEqual(review.decision, "PILOT READY WITH CONTROLS")
        self.assertEqual(review.score, 1.0)
        self.assertEqual(tuple(review.stages), ROLES)

    def test_missing_control_blocks_readiness(self):
        review = evaluate(CASE, {"human_approval": True})
        self.assertEqual(review.decision, "NOT READY")
        self.assertEqual(review.score, 0.25)

    def test_short_input_rejected(self):
        with self.assertRaises(ValueError):
            evaluate("short", {})

if __name__ == "__main__":
    unittest.main()
