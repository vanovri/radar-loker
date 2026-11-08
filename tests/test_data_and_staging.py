#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Unit & data-contract tests for `scripts/build_data.py`, `data/*.json`,
`execution-pack-2026-11-04/rank_astra_vacancies.py`, `stage_email_applications.py`,
`autofill_helper.py`, and `audit-2026-11-04.json`.

All tests are strictly read-only against repository production files (or use `tmp_path`).
"""

from __future__ import annotations

import importlib.util
import json
from pathlib import Path
import subprocess
import sys

REPO_ROOT = Path(__file__).resolve().parent.parent
EXEC_DIR = REPO_ROOT / "execution-pack-2026-11-04"


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec is not None and spec.loader is not None
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


def test_build_data_pure_classifiers() -> None:
    bd = _load_module("build_data_mod", REPO_ROOT / "scripts" / "build_data.py")

    # Public job boards are preserved; corporate portals are anonymized
    assert bd.portal_label("JobStreet") == "JobStreet"
    assert bd.portal_label(" linked in ") == "LinkedIn"
    assert bd.portal_label("career.astra.co.id") == "Portal karier perusahaan"

    # Funnel stage mapping precedence
    assert bd.stage_of("Offer Letter Sent") == "Offer"
    assert bd.stage_of("Undangan Psikotes & Wawancara HR") == "Interview"
    assert bd.stage_of("Lamaran Tidak Lolos Seleksi") == "Ditolak"
    assert bd.stage_of("Seleksi Administratif - Dalam Proses") == "Diproses"
    assert bd.stage_of("Viewed by employer") == "Dilihat HR"
    assert bd.stage_of("Terkirim") == "Menunggu respons"

    # Role family classification
    assert bd.role_family("Backend Python Developer") == "Software/IT"
    assert bd.role_family("Electrical Maintenance Engineer") == "Teknisi/Elektro"
    assert bd.role_family("B2B Account Executive") == "Sales/Bisnis"
    assert bd.role_family("Management Trainee Manufacture") == "Trainee/MT"
    assert bd.role_family("Operator Produksi") == "Admin/Operasional"
    assert bd.role_family("Legal Counsel") == "Lainnya"


def test_published_experiment_and_log_json_privacy_and_invariants() -> None:
    eksp_path = REPO_ROOT / "data" / "eksperimen.json"
    log_path = REPO_ROOT / "data" / "log.json"
    assert eksp_path.exists() and log_path.exists()

    eksp = json.loads(eksp_path.read_text(encoding="utf-8"))
    # Privacy contract: --with-roles must NEVER be committed to public data/eksperimen.json
    assert "roles" not in eksp, "Public data/eksperimen.json must not leak company/role rows"
    assert eksp["total"] > 0
    assert eksp["companies"] > 0
    assert 1 <= eksp["day"] <= eksp["days"]

    funnel_sum = sum(item["count"] for item in eksp["funnel"])
    portal_sum = sum(item["count"] for item in eksp["portals"])
    family_sum = sum(item["count"] for item in eksp["families"])
    assert funnel_sum == eksp["total"]
    assert portal_sum == eksp["total"]
    assert family_sum == eksp["total"]

    logs = json.loads(log_path.read_text(encoding="utf-8"))
    assert isinstance(logs, list) and len(logs) >= 1
    for entry in logs:
        assert {"date", "title", "note"} <= set(entry.keys())


def test_rank_astra_helpers_and_non_sales_invariants() -> None:
    ra = _load_module("rank_astra_mod", EXEC_DIR / "rank_astra_vacancies.py")

    assert ra.slugify_title("Engineering - AOP (S1)") == "Engineering-AOP-S1"
    assert ra.slugify_title("   ---   ") == "Vacancy"
    assert (
        ra.build_direct_url(13651, "Engineering - AOP")
        == "https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP"
    )
    assert ra.strip_html("<p>Minimal <b>S1 Teknik &amp; Elektro</b></p>") == "Minimal S1 Teknik & Elektro"
    assert ra.strip_html("") == ""

    spec_ids = {item["vacancyId"] for item in ra.ELIGIBLE_VACANCY_SPECS}
    assert spec_ids.isdisjoint(ra.ALREADY_APPLIED_IDS)
    excluded_ids = {item["vacancyId"] for item in ra.EXCLUDED_NOTABLE_VACANCIES}
    assert spec_ids.isdisjoint(excluded_ids)


def test_stage_email_applications_inspector_and_gmail_url_builder() -> None:
    se = _load_module("stage_email_mod", EXEC_DIR / "stage_email_applications.py")

    payload_01 = json.loads((EXEC_DIR / "payloads" / "RADAR-261104-01.json").read_text(encoding="utf-8"))
    inspected = se.inspect_eml_file(EXEC_DIR / "eml" / "RADAR-261104-01.eml", payload_01)
    assert inspected["content_checks"]["all_checks_passed"] is True
    assert inspected["headers"]["X-Unsent"] == "1"
    assert len(inspected["attachments"]) == 2
    assert inspected["gmail_web_compose_url"].startswith("https://mail.google.com/mail/?view=cm&fs=1&")
    assert inspected["mailto_url"].startswith("mailto:")

    ps1_script = se.generate_powershell_launcher([inspected])
    assert "STAGE_ONLY" in ps1_script or "NEVER dispatches live emails" in ps1_script
    assert "email_dispatch_manifest.json" in ps1_script


def test_autofill_helper_cli_list_and_audit_ledger_schema() -> None:
    proc = subprocess.run(
        [sys.executable, str(EXEC_DIR / "autofill_helper.py"), "--list"],
        capture_output=True,
        text=True,
        check=True,
    )
    lines = [ln for ln in proc.stdout.splitlines() if ln.startswith("RADAR-261104-")]
    assert len(lines) == 10

    audit_data = json.loads((REPO_ROOT / "audit-2026-11-04.json").read_text(encoding="utf-8"))
    assert audit_data["candidate"]["nin"] == "001008202012026100162"
    apps = audit_data["applications"]
    assert len(apps) >= 170
    uids = [a["uid"] for a in apps]
    assert len(uids) == len(set(uids)), "Every application UID in audit-2026-11-04.json must be unique"
