#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Automated verification tests for 2026-11-04 Execution Pipeline:
- Locked documents integrity (Master CV ATS, Ijazah, Transkrip)
- 10 RFC-822 .eml files parsed with Python's email module (exact filenames, byte sizes, SHA-256 hashes)
- 10 portal autofill JSON payloads (structure, NIN, GPA, locked document paths)
- Pipeline status & markdown report completeness
"""

from __future__ import annotations

import email
from email import policy
import hashlib
import json
from pathlib import Path

BASE_DIR = Path(r"C:\Users\ardhy\.gemini\antigravity\scratch\radar-loker")
EXEC_DIR = BASE_DIR / "execution-pack-2026-11-04"
EML_DIR = EXEC_DIR / "eml"
PAYLOAD_DIR = EXEC_DIR / "payloads"

EXPECTED_UIDS = [f"RADAR-261104-{i:02d}" for i in range(1, 11)]
CV_SHA256 = "c0a566b32a6cee1472509d2a01bab538dbdf95494fc7df45adcd61e41f3f8bc3"
CV_BYTES = 99026
IJAZAH_SHA256 = "650935932916f5655ba50151caed6fd07b52acabecf2cb41f60046f29a86d5ab"
IJAZAH_BYTES = 1056099
NIN = "001008202012026100162"


def test_locked_documents_on_disk() -> None:
    status_file = BASE_DIR / "pipeline-status-2026-11-04.json"
    assert status_file.exists(), "pipeline-status-2026-11-04.json must exist"
    data = json.loads(status_file.read_text(encoding="utf-8"))
    docs = data["locked_documents_verification"]
    assert docs["master_cv"]["verified"] is True
    assert docs["master_cv"]["bytes"] == CV_BYTES
    assert docs["master_cv"]["sha256"] == CV_SHA256
    assert docs["ijazah"]["verified"] is True
    assert docs["ijazah"]["bytes"] == IJAZAH_BYTES
    assert docs["ijazah"]["sha256"] == IJAZAH_SHA256
    assert docs["transkrip"]["verified"] is True


def test_all_10_eml_packages_rfc822_and_attachments() -> None:
    for uid in EXPECTED_UIDS:
        eml_path = EML_DIR / f"{uid}.eml"
        assert eml_path.exists(), f"Missing EML file: {eml_path}"
        msg = email.message_from_bytes(eml_path.read_bytes(), policy=policy.default)
        assert msg["From"] == "Ardhya Novri Ramadhan <ardhyasan@gmail.com>"
        assert msg["Subject"] and "Ardhya Novri Ramadhan" in msg["Subject"]
        assert msg["X-Radar-Target-UID"] == uid

        body_part = msg.get_body(preferencelist=("plain",))
        assert body_part is not None
        body_text = body_part.get_content()
        assert NIN in body_text
        assert "3.43" in body_text or "3,43" in body_text

        attachments = list(msg.iter_attachments())
        assert len(attachments) == 2, f"{uid}.eml must have exactly 2 attachments (CV + Ijazah)"

        cv_part = attachments[0]
        cv_raw = cv_part.get_payload(decode=True)
        assert cv_part.get_filename() == "Ardhya Novri Ramadhan - CV ATS.pdf"
        assert len(cv_raw) == CV_BYTES
        assert hashlib.sha256(cv_raw).hexdigest().lower() == CV_SHA256

        ijazah_part = attachments[1]
        ijazah_raw = ijazah_part.get_payload(decode=True)
        assert ijazah_part.get_filename() == "Ijazah Ardhya Novri.pdf"
        assert len(ijazah_raw) == IJAZAH_BYTES
        assert hashlib.sha256(ijazah_raw).hexdigest().lower() == IJAZAH_SHA256


def test_all_10_json_payloads() -> None:
    for uid in EXPECTED_UIDS:
        p_path = PAYLOAD_DIR / f"{uid}.json"
        assert p_path.exists(), f"Missing JSON payload: {p_path}"
        p = json.loads(p_path.read_text(encoding="utf-8"))
        assert p["uid"] == uid
        fields = p["form_autofill_fields"]
        assert fields["full_name"] == "Ardhya Novri Ramadhan, S.T."
        assert fields["national_diploma_number_nin"] == NIN
        assert fields["gpa"] == 3.43
        assert fields["upload_files"]["cv_sha256"] == CV_SHA256
        assert fields["upload_files"]["ijazah_sha256"] == IJAZAH_SHA256
        assert "SKL" not in json.dumps(fields["upload_files"])
        if uid == "RADAR-261104-06":
            assert p["evidence_status"] == "A_SENT_VERIFIED"
            assert p["live_submission"]["applicationId"] == 8035695
            assert p["live_submission"]["applicantId"] == 1682513
            assert p["live_submission"]["vacancyId"] == 13651
        else:
            assert p["evidence_status"] == "B_LIVE_VERIFIED_STAGED_PACKAGE"


def test_astra_eligible_shortlist_and_report() -> None:
    shortlist_json = EXEC_DIR / "astra_eligible_shortlist_2026_11_04.json"
    shortlist_md = EXEC_DIR / "ASTRA_SHORTLIST_2026-11-04.md"
    rank_script = EXEC_DIR / "rank_astra_vacancies.py"
    apply_shortlist_mjs = EXEC_DIR / "apply_astra_shortlist.mjs"

    assert rank_script.exists(), "rank_astra_vacancies.py must exist"
    assert apply_shortlist_mjs.exists(), "apply_astra_shortlist.mjs must exist"
    assert shortlist_json.exists(), "astra_eligible_shortlist_2026_11_04.json must exist"
    assert shortlist_md.exists(), "ASTRA_SHORTLIST_2026-11-04.md must exist"

    data = json.loads(shortlist_json.read_text(encoding="utf-8"))
    assert data["candidate"]["nin"] == NIN
    assert data["eligible_active_deadline_count"] >= 7

    prior_applied = {14929, 14930, 14938, 15040, 15041, 13651}
    sales_excluded = {13609, 13624, 13744, 14132}
    for item in data["shortlist"]:
        vid = item["vacancyId"]
        assert vid not in prior_applied, f"Already applied vacancy {vid} must not be in new shortlist"
        assert vid not in sales_excluded, f"Sales/Marketing vacancy {vid} must be excluded"
        assert item["direct_url"].startswith(f"https://career.astra.co.id/lowongan/lowongan-detail-page/{vid}/")
        assert "PASS" in item["non_sales_verification"]


def test_email_dispatch_manifest_and_ps1_launcher() -> None:
    stage_script = EXEC_DIR / "stage_email_applications.py"
    manifest_json = EXEC_DIR / "email_dispatch_manifest.json"
    ps1_launcher = EXEC_DIR / "Open-Drafts-In-MailClient.ps1"

    assert stage_script.exists(), "stage_email_applications.py must exist"
    assert manifest_json.exists(), "email_dispatch_manifest.json must exist"
    assert ps1_launcher.exists(), "Open-Drafts-In-MailClient.ps1 must exist"

    manifest = json.loads(manifest_json.read_text(encoding="utf-8"))
    assert manifest["safety_policy"] == "STAGE_ONLY_NO_UNSOLICITED_LIVE_SEND"
    assert manifest["summary"]["total_packages_inspected"] == 10
    assert manifest["summary"]["all_rfc822_and_hash_checks_passed"] is True

    for pkg in manifest["packages"]:
        assert pkg["content_checks"]["all_checks_passed"] is True
        assert pkg["content_checks"]["master_cv_locked_verified"] is True
        assert pkg["content_checks"]["official_ijazah_locked_verified"] is True
        assert pkg["gmail_web_compose_url"].startswith("https://mail.google.com/mail/?view=cm&fs=1&")


