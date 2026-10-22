import unittest
from framework_examples import (
    STAGES, langchain_pattern, langgraph_pattern, crewai_pattern, autogen_pattern
)

CASE = "Synthetic scheduling workflow with staff review."

class FrameworkPatternTests(unittest.TestCase):
    def test_chain(self):
        steps = langchain_pattern(CASE)
        self.assertEqual([step.role for step in steps], list(STAGES))
        self.assertIn("architecture:", steps[1].input_text)

    def test_graph(self):
        state = langgraph_pattern(CASE)
        self.assertEqual(len(state["history"]), 4)
        self.assertIn("evaluation:", state["context"])

    def test_crew(self):
        tasks = crewai_pattern(CASE)
        self.assertEqual(len(tasks), 4)
        self.assertEqual(tasks[0][0]["agent"], "architecture")

    def test_bounded_conversation(self):
        conversation = autogen_pattern(CASE, max_messages=2)
        self.assertTrue(conversation["terminated"])
        self.assertEqual(len(conversation["messages"]), 2)

    def test_invalid_limit(self):
        with self.assertRaises(ValueError):
            autogen_pattern(CASE, max_messages=0)

if __name__ == "__main__":
    unittest.main()
