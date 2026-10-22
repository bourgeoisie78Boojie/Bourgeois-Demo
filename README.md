# BourgeoisAI — Agent Governance Lab

Public source for [aicraftmaster.com](https://aicraftmaster.com/), a governed multi-agent review demonstration.

## What actually runs

The website calls the existing BourgeoisAI production inference endpoint through a server-side quota gateway. It makes **five inference requests per completed review**: four sequential specialist reviews and a final synthesis. It does **not** execute LangChain, LangGraph, CrewAI or AutoGen libraries on the server. Framework selection conditions the architecture prompts. `framework_examples.py` contains **dependency-free illustrative patterns**, not framework integrations.

`agent_lab/` and `demo.html` provide an **offline deterministic example**; they do not call an LLM.

## Run local checks

Python 3.11+ and Node.js 20+:

```bash
python -m unittest discover -v
node --check public/assets/agents/agent-governance-lab.js
node --test tests/*.test.mjs
```

## Safety and limitations

- Never enter protected health information, credentials, or confidential customer data.
- This demo produces architectural guidance, **not medical advice or compliance certification**.
- The live inference endpoint is hosted in a **separate private production repository** and enforces its own rate limits and entitlements. A public-site browser limit is only a usability safeguard, not a security boundary.
- Production currently has per-network and per-identity AI limits. The gateway enforces 10 requests per minute and 30 per day per IP with a Redis-backed counter. It fails closed if its encrypted server-side quota configuration is unavailable.
- Never store provider credentials in this repository or in browser code.

## Security

See [SECURITY.md](SECURITY.md) for reporting instructions and supported scope. CI validates Python examples, frontend JavaScript syntax, security invariants and common secret patterns. These checks do not replace GitHub secret scanning, branch protection, provider billing alerts, or production-side abuse monitoring.

## Ownership

Copyright © 2026 BourgeoisAI. All rights reserved unless a separate license is explicitly granted.
