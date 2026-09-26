# Measured results (Phases 3–6)

Everything here was measured in the build environment (4-core Xeon CPU, no GPU) on 2026-09-26. Raw JSON is stored under `docs/results/`. **These are produce-identification results only.** No ripeness, freshness or spoilage labels were available, so those heads are untrained and flagged unsupported in every bundle.

**None of these is the Israeli real-world set** (Phase 5), which has not been collected yet. The closest proxy is the Grocery Store official test split: smartphone photos taken in Swedish supermarkets on different store visits from training.

## Phase 3 — baseline (commercially-cleared data only)

Config `ml/configs/p3_baseline_commercial.yaml`:
- MobileNetV3-Large with ImageNet weights, first 4 stages frozen.
- 224 px, 20 epochs, class-balanced sampling (α = 0.5).
- Trained on Grocery Store only: 1,510 train images, 462 validation images carved out of train by cluster.

| Split | n | top-1 | top-5 | macro-F1 | balanced acc. | worst-class recall | ECE (after T-scaling) |
|---|---|---|---|---|---|---|---|
| val (carved from train store visits) | 462 | 0.955 | — | 0.940 | — | 0.64 | 0.12 → (T = 0.63) |
| **test (official, different store visits)** | 1,704 | **0.849** | 0.990 | **0.788** | 0.741 | **0.32 (mandarin)** | 0.070 |

Per-class test recall, worst first:

| Class | Recall |
|---|---|
| mandarin | 0.32 (mostly → orange) |
| mango | 0.36 |
| nectarine | 0.40 |
| lemon | 0.44 |
| cucumber | 0.59 |
| avocado | 0.65 |
| kiwi | 0.67 |
| pomegranate | 0.68 |
| orange | 0.77 |
| plum | 0.77 |
| melon | 0.89 |
| pear | 0.89 |
| other | 0.91 |
| watermelon | 0.91 |
| peach | 0.92 |
| banana | 0.93 |
| tomato | 0.99 |
| pepper | 0.99 |
| apple | 1.00 |

**Gates (evaluation.md): FAIL.** Macro-F1 is 0.788 against a 0.85 gate. Recall is below 0.80 for 10 classes, including avocado and cucumber, whose gate is 0.90.

Decision policy on test, with thresholds tuned on validation for 95% accepted accuracy:
- 61.9% of scans get a result.
- Accuracy when a result is shown is **90.4%**. This misses the 95% target, so validation-tuned thresholds don't transfer to new store visits.

Findings:
1. **Carved validation sets are optimistic.** Clusters only catch near-duplicates, not "same store, same day", so val (0.955) overstates test (0.849). Validation for gating must be session-disjoint. That's easy for our own collection (split by fruit and date), but not possible for Grocery Store.
2. **Citrus is the weak spot.** Mandarin/orange/lemon confusion dominates. Israeli priorities include both mandarin and orange, so own-collected citrus data is a P0 need.
3. The overall-accuracy trap is real here. Top-1 of 0.85 hides a class that is recognized one time in three.

Reproducibility: same-seed rerun `p3_repro_commercial_mnv3` → see section below.

## Phase 6 — export and quantization (baseline model)

See [mobile.md](mobile.md). ONNX fp32 matches PyTorch exactly. Static int8 loses 6 points of top-1 and is rejected. **Core ML fp16 (8.2 MB) is chosen**, with 99.9% agreement.
