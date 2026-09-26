# Roadmap

Each phase ends only when its acceptance criteria are met and recorded (link run dirs / reports).

| Phase | Deliverables | Acceptance criteria | Status |
|---|---|---|---|
| **1 Research + registry** | registry (19 rows), label taxonomy + mappings, licensing analysis, architecture, eval plan | Every dataset has licence + verification level; unclear ⇒ blocked; tests enforce | **Done** (primary-source verification incomplete: sites blocked from build env) |
| **2a Ingestion + cleaning** | licence-gated downloader, adapters, validation, dedup, group splits, manifest | Pipeline unit + e2e tests pass; zero leakage assertion; unmapped labels fail loudly | **Code done**, not yet run on real downloads |
| 2b Licence verification | Visit each Mendeley/Zenodo/Kaggle page; counsel review; `license_signoffs.json` | Each P1/P2 dataset: `verified_primary` or sign-off, or excluded | Next — needs a human with unrestricted web |
| 2c Own data collection | Capture protocol, labelling tool, contributor agreement, first 3 produce types | ≥ 60 physical fruits/type, inter-rater κ ≥ 0.6 on ripeness | Next — needs people + produce |
| **3 Baseline** | MobileNetV3 multi-task on cleared data | Runs reproducible (same seed ⇒ metrics ± 0.5 pt); per-class report; gates evaluated | Pending data |
| 4 Multi-dataset + benchmark | Matrix in model-strategy.md; detector pre-stage decision | Chosen config beats baseline on worst-class recall and cross-dataset set, 3 seeds | — |
| 5 Real-world validation | ≥ 2,000-image real-world set; threshold tuning; error analysis | Release gates in evaluation.md on real-world set | — |
| 6 Mobile optimisation | Core ML export, quantisation, on-device benchmark | p90 < 150 ms iPhone 12, ≤ 25 MB, gates still pass after quantisation | — |
| 7 App integration | Expo dev build, native Core ML module, RTL UI, decision parity tests | Parity: app `decide()` == Python on 500 fixtures; offline works | — |
| 8 Beta | TestFlight to ~50 Israeli users, feedback loop | Real-world abstention and error rates within gates; no safety-wording complaints | — |
| 9 Production | Monitoring, model update channel, data credits screen | Crash-free ≥ 99.5%; retraining cadence defined | — |

## Immediate next steps (in order)

1. Human verification of licences for FruitNet, Hass avocado, Strawberry-avocado, Open Images (per-image), Mendeley BD fresh/rotten, Ripen-banana; add sign-offs.
2. Obtain Israeli consumption data (CBS household expenditure survey; Plants Production & Marketing Board reports) → finalise priority list.
3. Download Grocery Store (cleared) + confirmed CC BY sets; run `build_manifest`; fix adapter folder patterns against real layouts.
4. Start own-data capture for banana, avocado (incl. Ettinger), tomato.
5. Phase 3 baseline.
