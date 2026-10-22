"""Deterministic four-stage agent governance evaluation (no model/API calls)."""
from dataclasses import dataclass
from typing import Dict

ROLES = ("architect", "security", "governance", "evaluator")
REQUIRED = ("human_approval", "audit_log", "least_privilege", "bounded_execution")

@dataclass(frozen=True)
class Review:
    use_case: str
    stages: Dict[str, str]
    controls: Dict[str, bool]
    score: float
    decision: str

def evaluate(use_case: str, controls: Dict[str, bool]) -> Review:
    if not isinstance(use_case, str) or len(use_case.strip()) < 20:
        raise ValueError("Provide a descriptive synthetic use case (20+ characters)")
    normalized = {key: controls.get(key) is True for key in REQUIRED}
    score = sum(normalized.values()) / len(REQUIRED)
    stages = {
        "architect": "Identify data flow, boundaries, failure modes, and review checkpoints.",
        "security": "Check access control, privacy, prompt injection and data retention.",
        "governance": "Require approval gates, audit logs, and bounded execution.",
        "evaluator": "Check mandatory controls and assign a deterministic readiness decision.",
    }
    decision = "PILOT READY WITH CONTROLS" if score == 1 else "NOT READY"
    return Review(use_case.strip(), stages, normalized, score, decision)

def main() -> None:
    example = "An AI assistant drafts scheduling replies for human staff approval."
    result = evaluate(example, dict.fromkeys(REQUIRED, True))
    print(f"Decision: {result.decision} | Control coverage: {result.score:.0%}")
    for role in ROLES:
        print(f"{role}: {result.stages[role]}")

if __name__ == "__main__":
    main()


def main() -> None:
    example = "An AI assistant drafts scheduling replies for human staff approval."
    result = evaluate(example, dict.fromkeys(REQUIRED, True))
    print(f"Decision: {result.decision} | Control coverage: {result.score:.0%}")
    for role in ROLES:
        print(f"{role}: {result.stages[role]}")


if __name__ == "__main__":
    main()
