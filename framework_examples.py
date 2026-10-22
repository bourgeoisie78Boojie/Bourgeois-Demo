"""Independent, dependency-free examples of four agent orchestration patterns.

These are illustrative patterns, not imports or executions of third-party frameworks.
"""
from dataclasses import dataclass

STAGES = ("architecture", "security", "governance", "evaluation")

@dataclass(frozen=True)
class Step:
    role: str
    input_text: str
    output_text: str

def specialist(role: str, context: str) -> Step:
    return Step(role, context, f"{role}: review recorded; human approval required")

def langchain_pattern(use_case: str):
    """Composable pipeline with explicit context passing."""
    context = use_case
    steps = []
    for role in STAGES:
        step = specialist(role, context)
        steps.append(step)
        context += "\n" + step.output_text
    return steps

def langgraph_pattern(use_case: str):
    """State graph pattern with explicit state updates."""
    state = {"context": use_case, "history": []}
    for role in STAGES:
        step = specialist(role, state["context"])
        state["history"].append(step)
        state["context"] += "\n" + step.output_text
    return state

def crewai_pattern(use_case: str):
    """Role-based sequential task assignments."""
    crew = [{"agent": role, "task": f"Review {role} controls"} for role in STAGES]
    return [(assignment, specialist(assignment["agent"], use_case)) for assignment in crew]

def autogen_pattern(use_case: str, max_messages: int = 4):
    """Bounded message exchange with termination."""
    if max_messages < 1:
        raise ValueError("max_messages must be positive")
    messages = []
    for role in STAGES[:max_messages]:
        messages.append(specialist(role, use_case))
    return {"messages": messages, "terminated": True}
