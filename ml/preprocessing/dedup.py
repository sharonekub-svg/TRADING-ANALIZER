"""Duplicate / near-duplicate clustering with union-find.

Edges come from three sources:
  1. identical file bytes (sha256)
  2. identical decoded pixels (pixel_digest) -> re-encoded copies
  3. perceptual hash within `max_distance` bits -> augmented / near-duplicate
  4. explicit metadata groups (e.g. same physical fruit photographed on different days)

Candidate pairs for (3) come from multi-index hashing: the 64-bit hash is cut
into `n_bands` bands; two hashes within distance d < n_bands share at least one
band exactly (pigeonhole), so recall is exact for d <= n_bands - 1.
"""
from __future__ import annotations

from collections import defaultdict
from dataclasses import dataclass
from typing import Hashable, Iterable, Sequence

from ml.preprocessing.hashing import hamming


class UnionFind:
    def __init__(self, n: int):
        self.parent = list(range(n))

    def find(self, x: int) -> int:
        while self.parent[x] != x:
            self.parent[x] = self.parent[self.parent[x]]
            x = self.parent[x]
        return x

    def union(self, a: int, b: int) -> None:
        ra, rb = self.find(a), self.find(b)
        if ra != rb:
            self.parent[max(ra, rb)] = min(ra, rb)


@dataclass(frozen=True)
class DupRecord:
    sha256: str
    pixel_digest: str
    phash: int
    group_key: Hashable | None = None  # explicit metadata group, already namespaced by dataset


def _bands(h: int, n_bands: int) -> list[tuple[int, int]]:
    width = 64 // n_bands
    mask = (1 << width) - 1
    return [(i, (h >> (i * width)) & mask) for i in range(n_bands)]


def cluster(records: Sequence[DupRecord], max_distance: int = 6, n_bands: int = 8,
            max_bucket: int = 5000) -> tuple[list[int], dict[str, int]]:
    """Return (cluster_id per record, stats). Cluster ids are the smallest member index."""
    if max_distance >= n_bands:
        raise ValueError("max_distance must be < n_bands for exact candidate recall")
    n = len(records)
    uf = UnionFind(n)
    stats = defaultdict(int)

    def link_equal(keys: Iterable[tuple[Hashable, int]], name: str) -> None:
        first: dict[Hashable, int] = {}
        for key, i in keys:
            if key is None:
                continue
            if key in first:
                if uf.find(first[key]) != uf.find(i):
                    stats[name] += 1
                uf.union(first[key], i)
            else:
                first[key] = i

    link_equal(((r.sha256, i) for i, r in enumerate(records)), "exact_file")
    link_equal(((r.pixel_digest, i) for i, r in enumerate(records)), "exact_pixels")
    link_equal(((r.group_key, i) for i, r in enumerate(records)), "metadata_group")

    buckets: dict[tuple[int, int], list[int]] = defaultdict(list)
    for i, r in enumerate(records):
        for b in _bands(r.phash, n_bands):
            buckets[b].append(i)
    for members in buckets.values():
        if len(members) > max_bucket:
            stats["skipped_oversized_buckets"] += 1  # degenerate hashes (e.g. blank images)
            continue
        for a_pos, a in enumerate(members):
            for b in members[a_pos + 1:]:
                if uf.find(a) == uf.find(b):
                    continue
                if hamming(records[a].phash, records[b].phash) <= max_distance:
                    uf.union(a, b)
                    stats["near_duplicate"] += 1
    ids = [uf.find(i) for i in range(n)]
    stats["clusters"] = len(set(ids))
    stats["records"] = n
    return ids, dict(stats)
