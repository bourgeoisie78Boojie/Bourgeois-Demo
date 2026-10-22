# BourgeoisAI — Agent Governance Demo

A public, self-contained demonstration of a **bounded AI governance review pipeline**, adapted from the BourgeoisAI Agent Governance Lab at https://www.bourgeoisai.com/agents.

This public edition uses deterministic evaluation, **not live LLM inference**. It contains no proprietary backend code, API keys, or production integration.

## Workflow

1. Architecture — define boundaries, components and human approval points
2. Security — flag sensitive data, injection and access-control risks
3. Governance — establish prohibited actions, review gates and traceability
4. Evaluation — score required controls and identify gaps

## Run

Requires Python 3.11+; no external packages.

```bash
python -m unittest discover -v
python -m agent_lab.core
```

## Framework reference

The private production lab includes LangChain, LangGraph, CrewAI and AutoGen examples. This repository deliberately demonstrates the shared governance/evaluation contract **without claiming to execute those frameworks**.

## Safety

Synthetic use cases only. No PHI, secrets, live model calls, clinical decision support or autonomous external actions.

## Related live interface

https://www.bourgeoisai.com/agents
