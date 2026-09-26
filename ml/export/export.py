"""Export a trained checkpoint to ONNX and (optionally) Core ML, plus a model bundle.

  python -m ml.export.export --ckpt runs/.../best.pt --out exports/v0 [--coreml] [--fp16]

The bundle (bundle.json) is the ONLY contract the app depends on:
class lists, input spec, temperatures, thresholds, supported_heads, version.
"""
from __future__ import annotations

import argparse
import hashlib
import json
from pathlib import Path

import torch

from ml.common.taxonomy import HEADS, load_taxonomy
from ml.inference.decision import DEFAULT_THRESHOLDS
from ml.training.model import build_model

OUTPUT_NAMES = ["produce", "ripeness", "freshness", "visual_spoilage"]


class ExportWrapper(torch.nn.Module):
    """Fixed-signature wrapper: image -> 4 logit tensors (no features, no conditioning input)."""
    def __init__(self, net, normalize_inside: bool = False):
        super().__init__()
        self.net = net
        self.normalize_inside = normalize_inside
        self.register_buffer("mean", torch.tensor([0.485, 0.456, 0.406]).view(1, 3, 1, 1))
        self.register_buffer("std", torch.tensor([0.229, 0.224, 0.225]).view(1, 3, 1, 1))

    def forward(self, x):
        if self.normalize_inside:  # x in [0, 1]
            x = (x - self.mean) / self.std
        o = self.net(x)
        return tuple(o[h] for h in OUTPUT_NAMES)


def load(ckpt_path: Path):
    ck = torch.load(ckpt_path, map_location="cpu")
    tax = load_taxonomy()
    cfg = ck["cfg"]
    cfg["model"]["pretrained"] = False
    net = build_model(cfg, {h: tax.num_classes(h) for h in HEADS})
    net.load_state_dict(ck["model"])
    return net.eval(), cfg, tax


def export_onnx(net, size: int, out: Path, opset: int = 17) -> Path:
    path = out / "model.onnx"
    torch.onnx.export(ExportWrapper(net), torch.randn(1, 3, size, size), path, input_names=["image"],
                      output_names=OUTPUT_NAMES, opset_version=opset, dynamic_axes={"image": {0: "batch"}})
    return path


def export_coreml(net, size: int, out: Path, fp16: bool = True) -> Path:
    import coremltools as ct  # macOS recommended for validation; conversion works on Linux
    # Per-channel normalisation lives inside the graph (ImageType only has a scalar scale).
    traced = torch.jit.trace(ExportWrapper(net, normalize_inside=True).eval(), torch.rand(1, 3, size, size))
    mlm = ct.convert(
        traced,
        inputs=[ct.ImageType(name="image", shape=(1, 3, size, size), scale=1 / 255.0,
                             color_layout=ct.colorlayout.RGB)],
        outputs=[ct.TensorType(name=n) for n in OUTPUT_NAMES],
        compute_precision=ct.precision.FLOAT16 if fp16 else ct.precision.FLOAT32,
        minimum_deployment_target=ct.target.iOS16,
    )
    path = out / "ProduceScanner.mlpackage"
    mlm.save(str(path))
    return path


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--ckpt", type=Path, required=True)
    ap.add_argument("--out", type=Path, required=True)
    ap.add_argument("--coreml", action="store_true")
    ap.add_argument("--fp16", action="store_true")
    ap.add_argument("--supported-heads", type=Path, help="json produced from the training manifest")
    args = ap.parse_args()
    args.out.mkdir(parents=True, exist_ok=True)
    net, cfg, tax = load(args.ckpt)
    size = cfg["data"]["image_size"]
    files = [export_onnx(net, size, args.out)]
    if args.coreml:
        files.append(export_coreml(net, size, args.out, args.fp16))
    run_dir = args.ckpt.parent
    temps = json.loads((run_dir / "temperature.json").read_text()) if (run_dir / "temperature.json").exists() else {}
    bundle = {
        "bundle_version": 1,
        "model_id": f"{cfg['experiment']}@{hashlib.sha256(args.ckpt.read_bytes()).hexdigest()[:12]}",
        "input": {"size": size, "layout": "NCHW", "mean": [0.485, 0.456, 0.406], "std": [0.229, 0.224, 0.225],
                  "resize": "short_side_then_center_crop", "resize_ratio": 1.14},
        "outputs": {h: list(tax.classes(h)) for h in OUTPUT_NAMES},
        "temperatures": temps,
        "thresholds": DEFAULT_THRESHOLDS,
        "supported_heads": json.loads(args.supported_heads.read_text()) if args.supported_heads else {},
        "produce_meta": tax.produce_meta,
        "label_he": tax.label_he,
        "files": [p.name for p in files],
    }
    (args.out / "bundle.json").write_text(json.dumps(bundle, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({"exported": [str(p) for p in files]}, indent=2))


if __name__ == "__main__":
    main()
