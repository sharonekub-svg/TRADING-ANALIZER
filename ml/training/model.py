"""Multi-task produce model.

One backbone, four heads. Architecture options benchmarked from one codebase:
  A  ripeness_mode="shared"       - one ripeness head for all produce
  C  ripeness_mode="per_produce"  - produce-conditioned ripeness head: logits[P, R],
                                    row selected by predicted/true produce
  B  = separate single-head models: set head_weights of other heads to 0.
"""
from __future__ import annotations

import torch
import torch.nn as nn


class MultiTaskProduceNet(nn.Module):
    def __init__(self, backbone: str, n_produce: int, n_ripeness: int, n_freshness: int,
                 n_spoilage: int, ripeness_mode: str = "shared", pretrained: bool = True,
                 dropout: float = 0.2):
        super().__init__()
        import timm
        self.backbone = timm.create_model(backbone, pretrained=pretrained, num_classes=0)
        # Pooled feature width; differs from num_features for nets with a conv head (e.g. MobileNetV3).
        d = getattr(self.backbone, "head_hidden_size", None) or self.backbone.num_features
        self.ripeness_mode = ripeness_mode
        self.n_produce, self.n_ripeness = n_produce, n_ripeness
        self.drop = nn.Dropout(dropout)
        self.produce = nn.Linear(d, n_produce)
        r_out = n_ripeness * (n_produce if ripeness_mode == "per_produce" else 1)
        self.ripeness = nn.Linear(d, r_out)
        self.freshness = nn.Linear(d, n_freshness)
        self.visual_spoilage = nn.Linear(d, n_spoilage)

    def forward(self, x: torch.Tensor, produce_idx: torch.Tensor | None = None) -> dict[str, torch.Tensor]:
        f = self.drop(self.backbone(x))
        out = {"produce": self.produce(f), "freshness": self.freshness(f),
               "visual_spoilage": self.visual_spoilage(f), "features": f}
        r = self.ripeness(f)
        if self.ripeness_mode == "per_produce":
            r = r.view(-1, self.n_produce, self.n_ripeness)
            pred = out["produce"].argmax(1)
            # -1 / None => condition on the predicted produce (inference, or unknown produce label)
            produce_idx = pred if produce_idx is None else torch.where(produce_idx < 0, pred, produce_idx)
            r = r[torch.arange(r.shape[0], device=r.device), produce_idx]
        out["ripeness"] = r
        return out


def build_model(cfg: dict, n_classes: dict[str, int]) -> MultiTaskProduceNet:
    m = cfg["model"]
    return MultiTaskProduceNet(
        backbone=m["backbone"], pretrained=m.get("pretrained", True),
        ripeness_mode=m.get("ripeness_mode", "shared"), dropout=m.get("dropout", 0.2),
        n_produce=n_classes["produce"], n_ripeness=n_classes["ripeness"],
        n_freshness=n_classes["freshness"], n_spoilage=n_classes["visual_spoilage"])
