#!/usr/bin/env bash
# Join the nostrometer tooling's data files into the two static JSON files the
# site serves from /data. Re-run after `make metrics claims` in ../nostrometer
# and commit the outputs.
set -euo pipefail

HERE="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SRC="${NOSTROMETER_DIR:-$HERE/../nostrometer}/data"
OUT="$HERE/public/data"

if [ ! -d "$SRC" ]; then
  echo "sync-data: source directory not found: $SRC" >&2
  echo "           set NOSTROMETER_DIR to the nostrometer checkout" >&2
  exit 1
fi

mkdir -p "$OUT"

python3 - "$SRC" "$OUT" <<'PY'
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

src = Path(sys.argv[1])
out = Path(sys.argv[2])


def jsonl(path):
    if not path.exists():
        return []
    return [json.loads(l) for l in path.read_text().splitlines() if l.strip()]


registry = [a for a in jsonl(src / "registry.jsonl") if not a.get("spam_like")]
metrics = json.loads((src / "metrics.json").read_text()) if (src / "metrics.json").exists() else {}
claimed = jsonl(src / "claimed.jsonl")
ratings = jsonl(src / "ratings.jsonl")

# Every address a rating could target: the primary listing plus any duplicate
# listings that were merged into the same app record.
addresses_of = {}
for a in registry:
    addrs = [a.get("address")] + list(a.get("duplicate_addresses") or [])
    addresses_of[a["id"]] = [x for x in addrs if x]

# Absent from metrics.json = never measured = null. A failed query is stored as
# null by the crawler too. Only a real count is ever a number.
mau_by_id = {m["id"]: m.get("mau") for m in metrics.get("apps", [])}

by_address = {}
for a in registry:
    for addr in addresses_of[a["id"]]:
        by_address.setdefault(addr, {
            "id": a["id"],
            "name": a["name"],
            "mau": mau_by_id.get(a["id"]),
        })

metrics_out = {
    "relay": metrics.get("relay"),
    "metric": metrics.get("metric"),
    "since": metrics.get("since"),
    "until": metrics.get("until"),
    "crawled_at": metrics.get("crawled_at"),
    "apps": len(registry),
    "byAddress": by_address,
}

claims_by_id = {}
for c in claimed:
    if not c.get("claimed"):
        continue
    entry = claims_by_id.setdefault(c["id"], {"repo": c.get("repo"), "nips": []})
    if c["nip"] not in entry["nips"]:
        entry["nips"].append(c["nip"])
for entry in claims_by_id.values():
    entry["nips"].sort()

claimed_by_address = {}
for app_id, entry in claims_by_id.items():
    for addr in addresses_of.get(app_id, []):
        claimed_by_address.setdefault(addr, entry)

researched = [c.get("researched_at") for c in claimed if c.get("researched_at")]
claimed_out = {
    "generated_at": max(researched) if researched else datetime.now(timezone.utc).isoformat(),
    "byAddress": claimed_by_address,
}

# Ratings snapshot: the crawler reads every relay to completion with nak and
# keeps the latest revision per (rater, app, nip). The site merges this with a
# live relay read so the matrix never shows fewer ratings than the last crawl.
snapshot = []
for r in ratings:
    if not (isinstance(r.get("id"), str) and isinstance(r.get("pubkey"), str)):
        continue
    if not isinstance(r.get("app_address"), str) or not r["app_address"].startswith("31990:"):
        continue
    snapshot.append({
        "id": r["id"],
        "pubkey": r["pubkey"],
        "created_at": r.get("created_at") or 0,
        "address": r["app_address"],
        "nip": r["nip"],
        "rating": r["rating"],
        "content": r.get("content") or "",
    })
snapshot.sort(key=lambda r: (r["address"], r["nip"], r["pubkey"]))
crawled = [r.get("crawled_at") for r in ratings if r.get("crawled_at")]
ratings_out = {
    "crawled_at": max(crawled) if crawled else None,
    "count": len(snapshot),
    "ratings": snapshot,
}
(out / "ratings.json").write_text(json.dumps(ratings_out, indent=1, sort_keys=True, ensure_ascii=False) + "\n")

(out / "metrics.json").write_text(json.dumps(metrics_out, indent=1, sort_keys=True) + "\n")
(out / "claimed.json").write_text(json.dumps(claimed_out, indent=1, sort_keys=True) + "\n")
print(f"sync-data: {len(by_address)} addresses, {len(claimed_by_address)} with claims, {len(snapshot)} ratings -> {out}")
PY
