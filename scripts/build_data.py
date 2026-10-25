"""Bangun data/eksperimen.json dari CSV crosscheck lamaran.

Privasi: hanya agregat (portal, status, jumlah) yang dipublikasikan.
Nama perusahaan dan posisi TIDAK ditulis ke output kecuali --with-roles.

Pakai:
    python scripts/build_data.py [path_csv] [--start 2026-10-23] [--with-roles]
"""
from __future__ import annotations

import argparse
import csv
import json
from collections import Counter
from datetime import date, datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEFAULT_CSV = Path(r"C:\Users\ardhy\Documents\Codex\2026-10-23\tol\outputs\Crosscheck_Lamaran_25_Oktober_2026.csv")

# Urutan funnel = status TERAKHIR tiap lamaran. Status mentah tiap portal dipetakan ke salah satu tahap ini.
STAGES = ["Menunggu respons", "Dilihat HR", "Diproses", "Interview", "Offer", "Ditolak"]

# Job board publik boleh disebut. Portal karier milik perusahaan disamarkan agar nama perusahaan tidak bocor.
PUBLIC_BOARDS = {"jobstreet": "JobStreet", "karirjakarta": "KarirJakarta", "glints": "Glints", "linkedin": "LinkedIn", "kalibrr": "Kalibrr", "dealls": "Dealls"}


def portal_label(portal: str) -> str:
    return PUBLIC_BOARDS.get(portal.strip().lower().replace(" ", ""), "Portal karier perusahaan")


def stage_of(status: str) -> str:
    s = status.lower()
    if any(k in s for k in ("offer", "ditawarkan", "diterima bekerja")):
        return "Offer"
    if any(k in s for k in ("interview", "wawancara", "psikotes", "user")):
        return "Interview"
    if any(k in s for k in ("tolak", "reject", "not selected", "tidak lolos", "unsuccessful")):
        return "Ditolak"
    if any(k in s for k in ("seleksi", "dalam proses", "shortlist", "in review", "reviewed")):
        return "Diproses"
    if "viewed" in s or "dilihat" in s:
        return "Dilihat HR"
    return "Menunggu respons"


def role_family(posisi: str) -> str:
    p = posisi.lower()
    rules = [
        ("Software/IT", ("programmer", "developer", "software", "it ", "it-", "odoo", "data", "web", "qa", "intern it", "it staff", "it support", "it project")),
        ("Teknisi/Elektro", ("teknisi", "electrical", "listrik", "plts", "mep", "engineer", "maintenance", "technical")),
        ("Sales/Bisnis", ("sales", "marketing", "business", "purchasing", "account")),
        ("Trainee/MT", ("trainee", "management trainee", "graduate", "talent pool")),
        ("Admin/Operasional", ("admin", "operation", "operator", "produksi", "transport", "staff")),
    ]
    for fam, keys in rules:
        if any(k in p for k in keys):
            return fam
    return "Lainnya"


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("csv", nargs="?", default=str(DEFAULT_CSV))
    ap.add_argument("--start", default="2026-10-23", help="Hari ke-1 eksperimen (YYYY-MM-DD)")
    ap.add_argument("--days", type=int, default=30)
    ap.add_argument("--with-roles", action="store_true", help="Sertakan daftar posisi+perusahaan (jangan dipublikasikan)")
    args = ap.parse_args()

    rows = list(csv.DictReader(open(args.csv, encoding="utf-8-sig")))
    if not rows:
        raise SystemExit("CSV kosong")

    # Dedup: portal + id, fallback posisi|perusahaan (Jobstreet tidak punya id)
    seen, uniq = set(), []
    for r in rows:
        key = (r["portal"].strip(), r.get("id", "").strip() or f"{r['posisi']}|{r['perusahaan']}".lower())
        if key in seen:
            continue
        seen.add(key)
        uniq.append(r)

    stages = Counter(stage_of(r.get("status", "")) for r in uniq)
    portals = Counter(portal_label(r["portal"]) for r in uniq)
    families = Counter(role_family(r.get("posisi", "")) for r in uniq)
    companies = len({r["perusahaan"].strip().lower() for r in uniq})

    start = date.fromisoformat(args.start)
    today = date.today()
    day_n = max(1, min(args.days, (today - start).days + 1))
    total = len(uniq)
    responded = sum(stages[s] for s in ("Dilihat HR", "Diproses", "Interview", "Offer", "Ditolak"))

    out = {
        "generated_at": datetime.now().isoformat(timespec="seconds"),
        "source_rows": len(rows),
        "start": args.start,
        "days": args.days,
        "day": day_n,
        "total": total,
        "companies": companies,
        "responded": responded,
        "response_rate": round(responded / total * 100, 1) if total else 0,
        "funnel": [{"stage": s, "count": stages.get(s, 0)} for s in STAGES],
        "portals": [{"name": k, "count": v} for k, v in portals.most_common()],
        "families": [{"name": k, "count": v} for k, v in families.most_common()],
    }
    if args.with_roles:
        out["roles"] = [{"portal": r["portal"], "posisi": r["posisi"], "perusahaan": r["perusahaan"], "status": r["status"]} for r in uniq]

    dest = ROOT / "data" / "eksperimen.json"
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(json.dumps(out, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps({k: out[k] for k in ("day", "total", "companies", "responded", "response_rate")}, ensure_ascii=False))
    print("funnel", {f["stage"]: f["count"] for f in out["funnel"]})
    print("portals", {p["name"]: p["count"] for p in out["portals"]})
    print("families", {p["name"]: p["count"] for p in out["families"]})


if __name__ == "__main__":
    main()
