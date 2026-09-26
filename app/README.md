# app/ — mobile application (Phase 7, not started)

Intentionally empty: per plan, the app is built only after the model passes Phase 5 gates.
Planned stack and contract: see `docs/architecture.md` (Expo dev build + Swift Expo Module for Core ML)
and `docs/product-spec.md`. The app consumes only `exports/<version>/bundle.json` + the model file,
and ports `ml/inference/decision.py` 1:1 (parity-tested via JSON fixtures in `tests/app/`).
