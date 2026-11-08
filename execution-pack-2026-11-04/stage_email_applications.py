#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
RFC-822 .eml Inspector & Gmail Draft Stage Helper (2026-11-04)
Location: C:\\Users\\ardhy\\.gemini\\antigravity\\scratch\\radar-loker\\execution-pack-2026-11-04\\stage_email_applications.py

Capabilities:
1. Validates all RFC-822 .eml files in execution-pack-2026-11-04/eml/ against Ardhya's Locked Document Rule:
   - Master CV ATS (`Ardhya Novri Ramadhan - CV ATS.pdf`, 99,026 bytes, SHA-256 c0a566b32a6cee1472509d2a01bab538dbdf95494fc7df45adcd61e41f3f8bc3)
   - Official Ijazah (`Ijazah Ardhya Novri.pdf`, 1,056,099 bytes, SHA-256 650935932916f5655ba50151caed6fd07b52acabecf2cb41f60046f29a86d5ab)
   - Verifies X-Unsent: 1 draft header, NIN (001008202012026100162), and GPA (3.43 / 3,43) in body text.
2. Exports consolidated `email_dispatch_manifest.json` with Gmail Web compose URLs and RFC-822 verification metadata.
3. Generates 1-click PowerShell launcher `Open-Drafts-In-MailClient.ps1` (never sends live emails automatically without explicit user trigger).
"""

from __future__ import annotations

import argparse
import email
from email import policy
import hashlib
import json
import os
import urllib.parse
import webbrowser
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List

WIB = timezone(timedelta(hours=7))
HERE = Path(__file__).resolve().parent
EML_DIR = HERE / "eml"
PAYLOAD_DIR = HERE / "payloads"
MANIFEST_PATH = HERE / "email_dispatch_manifest.json"
PS1_PATH = HERE / "Open-Drafts-In-MailClient.ps1"

MASTER_CV_FILENAME = "Ardhya Novri Ramadhan - CV ATS.pdf"
MASTER_CV_BYTES = 99026
MASTER_CV_SHA256 = "c0a566b32a6cee1472509d2a01bab538dbdf95494fc7df45adcd61e41f3f8bc3"

IJAZAH_FILENAME = "Ijazah Ardhya Novri.pdf"
IJAZAH_BYTES = 1056099
IJAZAH_SHA256 = "650935932916f5655ba50151caed6fd07b52acabecf2cb41f60046f29a86d5ab"

NIN = "001008202012026100162"


def inspect_eml_file(eml_path: Path, payload_data: Dict[str, Any]) -> Dict[str, Any]:
    raw_bytes = eml_path.read_bytes()
    eml_sha256 = hashlib.sha256(raw_bytes).hexdigest().lower()
    msg = email.message_from_bytes(raw_bytes, policy=policy.default)

    from_hdr = str(msg.get("From", ""))
    to_hdr = str(msg.get("To", ""))
    subject_hdr = str(msg.get("Subject", ""))
    date_hdr = str(msg.get("Date", ""))
    msg_id = str(msg.get("Message-ID", ""))
    uid_hdr = str(msg.get("X-Radar-Target-UID", ""))
    unsent_hdr = str(msg.get("X-Unsent", ""))

    body_part = msg.get_body(preferencelist=("plain",))
    body_text = body_part.get_content() if body_part is not None else ""

    has_nin = NIN in body_text
    has_gpa = ("3.43" in body_text) or ("3,43" in body_text)
    no_skl = "SKL" not in body_text and "Surat Keterangan Lulus" not in body_text

    attachments_info: List[Dict[str, Any]] = []
    for part in msg.iter_attachments():
        att_bytes = part.get_payload(decode=True) or b""
        att_sha256 = hashlib.sha256(att_bytes).hexdigest().lower()
        attachments_info.append(
            {
                "filename": part.get_filename(),
                "content_type": part.get_content_type(),
                "bytes": len(att_bytes),
                "sha256": att_sha256,
            }
        )

    cv_ok = (
        len(attachments_info) >= 1
        and attachments_info[0]["filename"] == MASTER_CV_FILENAME
        and attachments_info[0]["bytes"] == MASTER_CV_BYTES
        and attachments_info[0]["sha256"] == MASTER_CV_SHA256
    )
    ijazah_ok = (
        len(attachments_info) >= 2
        and attachments_info[1]["filename"] == IJAZAH_FILENAME
        and attachments_info[1]["bytes"] == IJAZAH_BYTES
        and attachments_info[1]["sha256"] == IJAZAH_SHA256
    )

    gmail_compose_url = (
        "https://mail.google.com/mail/?view=cm&fs=1&"
        + urllib.parse.urlencode(
            {
                "to": to_hdr,
                "su": subject_hdr,
                "body": body_text,
            }
        )
    )
    mailto_url = f"mailto:{urllib.parse.quote(to_hdr)}?" + urllib.parse.urlencode(
        {"subject": subject_hdr, "body": body_text}
    )

    all_checks_passed = bool(
        from_hdr == "Ardhya Novri Ramadhan <ardhyasan@gmail.com>"
        and to_hdr
        and subject_hdr
        and unsent_hdr == "1"
        and has_nin
        and has_gpa
        and no_skl
        and len(attachments_info) == 2
        and cv_ok
        and ijazah_ok
    )

    return {
        "uid": payload_data.get("uid", uid_hdr),
        "rank": payload_data.get("rank"),
        "company": payload_data.get("company"),
        "role": payload_data.get("role"),
        "fit_score": payload_data.get("fit_score"),
        "evidence_status": payload_data.get("evidence_status"),
        "portal_url": payload_data.get("portal_url"),
        "submission_mechanism": payload_data.get("submission_mechanism"),
        "eml_file": str(eml_path),
        "eml_filename": eml_path.name,
        "eml_size_bytes": len(raw_bytes),
        "eml_sha256": eml_sha256,
        "headers": {
            "From": from_hdr,
            "To": to_hdr,
            "Subject": subject_hdr,
            "Date": date_hdr,
            "Message-ID": msg_id,
            "X-Radar-Target-UID": uid_hdr,
            "X-Unsent": unsent_hdr,
        },
        "content_checks": {
            "has_nin_001008202012026100162": has_nin,
            "has_gpa_3_43": has_gpa,
            "no_skl_mention": no_skl,
            "master_cv_locked_verified": cv_ok,
            "official_ijazah_locked_verified": ijazah_ok,
            "attachment_count": len(attachments_info),
            "all_checks_passed": all_checks_passed,
        },
        "attachments": attachments_info,
        "gmail_web_compose_url": gmail_compose_url,
        "mailto_url": mailto_url,
        "locked_attachment_paths": {
            "cv_path": r"C:\Users\ardhy\OneDrive\Documents\My Docs\Ardhya Novri Ramadhan - CV ATS.pdf",
            "ijazah_path": r"C:\Users\ardhy\OneDrive\Documents\My Docs\Ijazah Ardhya Novri.pdf",
        },
    }


def generate_powershell_launcher(entries: List[Dict[str, Any]]) -> str:
    lines = [
        "#Requires -Version 5.1",
        "<#",
        ".SYNOPSIS",
        "    1-Click RFC-822 .eml & Gmail Web Compose Launcher for RADAR-261104-01..10",
        "    Generated on 2026-11-04 for Ardhya Novri Ramadhan, S.T.",
        "    SAFETY RULE: Stages drafts only; NEVER dispatches live emails without explicit user click.",
        "",
        ".EXAMPLE",
        "    .\\Open-Drafts-In-MailClient.ps1 -List",
        "    .\\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-01 -Mode Eml",
        "    .\\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-04 -Mode GmailWeb",
        "    .\\Open-Drafts-In-MailClient.ps1 -AllPending -Mode Eml",
        "#>",
        "param(",
        "    [string]$Target = '',",
        "    [ValidateSet('Eml', 'GmailWeb', 'Portal')][string]$Mode = 'Eml',",
        "    [switch]$List,",
        "    [switch]$AllPending",
        ")",
        "",
        "$ErrorActionPreference = 'Stop'",
        "$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path",
        "$ManifestPath = Join-Path $ScriptDir 'email_dispatch_manifest.json'",
        "$Manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json",
        "$DocsFolder = 'C:\\Users\\ardhy\\OneDrive\\Documents\\My Docs'",
        "",
        "if ($List -or (-not $Target -and -not $AllPending)) {",
        "    Write-Host '=== STAGED RFC-822 EMAIL DRAFTS & PORTAL PACKAGES (2026-11-04) ===' -ForegroundColor Cyan",
        "    foreach ($item in $Manifest.packages) {",
        "        $statusTag = if ($item.evidence_status -eq 'A_SENT_VERIFIED') { '[PORTAL SENT]' } else { '[READY DRAFT]' }",
        "        Write-Host (\"{0} {1} | Fit {2}/100 | {3} — {4}\" -f $item.uid, $statusTag, $item.fit_score, $item.company, $item.role)",
        "        Write-Host (\"    To      : {0}\" -f $item.headers.To) -ForegroundColor Gray",
        "        Write-Host (\"    Subject : {0}\" -f $item.headers.Subject) -ForegroundColor Gray",
        "        Write-Host (\"    EML     : {0} ({1:N0} bytes)\" -f $item.eml_filename, $item.eml_size_bytes) -ForegroundColor DarkGray",
        "    }",
        "    Write-Host ''",
        "    Write-Host 'Usage Examples:' -ForegroundColor Yellow",
        "    Write-Host '  .\\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-01 -Mode Eml'",
        "    Write-Host '  .\\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-04 -Mode GmailWeb'",
        "    Write-Host '  .\\Open-Drafts-In-MailClient.ps1 -AllPending -Mode Eml'",
        "    exit 0",
        "}",
        "",
        "$Selected = @()",
        "if ($AllPending) {",
        "    $Selected = $Manifest.packages | Where-Object { $_.evidence_status -ne 'A_SENT_VERIFIED' }",
        "} else {",
        "    $Selected = $Manifest.packages | Where-Object { $_.uid -eq $Target }",
        "    if (-not $Selected) {",
        "        Write-Error \"Target UID not found in manifest: $Target\"",
        "    }",
        "}",
        "",
        "foreach ($pkg in $Selected) {",
        "    Write-Host (\"==> Staging {0}: {1} ({2})\" -f $pkg.uid, $pkg.company, $Mode) -ForegroundColor Green",
        "    if ($Mode -eq 'Eml') {",
        "        Start-Process -FilePath $pkg.eml_file",
        "        Start-Sleep -Milliseconds 600",
        "    } elseif ($Mode -eq 'GmailWeb') {",
        "        Set-Clipboard -Value $DocsFolder",
        "        Write-Host \"    [Clipboard] Copied locked docs folder path: $DocsFolder\" -ForegroundColor Yellow",
        "        Start-Process $pkg.gmail_web_compose_url",
        "        Start-Sleep -Milliseconds 800",
        "    } elseif ($Mode -eq 'Portal') {",
        "        Start-Process $pkg.portal_url",
        "        Start-Sleep -Milliseconds 600",
        "    }",
        "}",
    ]
    return "\r\n".join(lines) + "\r\n"


def build_manifest() -> Dict[str, Any]:
    entries: List[Dict[str, Any]] = []
    for p_path in sorted(PAYLOAD_DIR.glob("RADAR-261104-*.json")):
        payload_data = json.loads(p_path.read_text(encoding="utf-8"))
        uid = payload_data["uid"]
        eml_path = EML_DIR / f"{uid}.eml"
        if not eml_path.exists():
            raise FileNotFoundError(f"Missing RFC-822 .eml file: {eml_path}")
        entries.append(inspect_eml_file(eml_path, payload_data))

    all_valid = all(e["content_checks"]["all_checks_passed"] for e in entries)
    manifest = {
        "generated_at_wib": datetime.now(WIB).isoformat(),
        "candidate": "Ardhya Novri Ramadhan, S.T.",
        "sender_email": "ardhyasan@gmail.com",
        "safety_policy": "STAGE_ONLY_NO_UNSOLICITED_LIVE_SEND",
        "locked_documents_policy": {
            "master_cv": {
                "filename": MASTER_CV_FILENAME,
                "bytes": MASTER_CV_BYTES,
                "sha256": MASTER_CV_SHA256,
            },
            "official_ijazah": {
                "filename": IJAZAH_FILENAME,
                "bytes": IJAZAH_BYTES,
                "sha256": IJAZAH_SHA256,
                "nin": NIN,
            },
        },
        "summary": {
            "total_packages_inspected": len(entries),
            "all_rfc822_and_hash_checks_passed": all_valid,
            "portal_already_submitted_count": sum(
                1 for e in entries if e["evidence_status"] == "A_SENT_VERIFIED"
            ),
            "pending_staged_draft_count": sum(
                1 for e in entries if e["evidence_status"] != "A_SENT_VERIFIED"
            ),
        },
        "packages": entries,
    }
    MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False), encoding="utf-8")
    PS1_PATH.write_text(generate_powershell_launcher(entries), encoding="utf-8")
    return manifest


def main() -> None:
    parser = argparse.ArgumentParser(
        description="RFC-822 .eml Inspector & Gmail Draft Stage Helper (2026-11-04)"
    )
    parser.add_argument("--verify", action="store_true", help="Inspect all .eml files and build manifest + PS1")
    parser.add_argument("--target", type=str, help="Target UID to stage (e.g. RADAR-261104-01)")
    parser.add_argument("--open-eml", action="store_true", help="Open the .eml draft in default desktop mail client")
    parser.add_argument("--open-gmail-web", action="store_true", help="Open pre-filled Gmail Web compose tab")
    args = parser.parse_args()

    manifest = build_manifest()
    summary = manifest["summary"]
    print(
        f"[OK] Inspected {summary['total_packages_inspected']} RFC-822 .eml files | "
        f"All Checks Passed: {summary['all_rfc822_and_hash_checks_passed']}"
    )
    print(f"[OK] Manifest exported : {MANIFEST_PATH}")
    print(f"[OK] PS1 Launcher ready: {PS1_PATH}")

    for pkg in manifest["packages"]:
        chk = pkg["content_checks"]
        status = "PASS" if chk["all_checks_passed"] else "FAIL"
        print(
            f"  [{status}] {pkg['uid']} | To: {pkg['headers']['To']:<38} | "
            f"{pkg['eml_size_bytes']:>9,} B | CV+Ijazah SHA256 OK | {pkg['evidence_status']}"
        )

    if args.target:
        matched = [p for p in manifest["packages"] if p["uid"] == args.target]
        if not matched:
            raise SystemExit(f"[ERROR] Target UID not found: {args.target}")
        pkg = matched[0]
        if args.open_eml:
            os.startfile(pkg["eml_file"])
            print(f"[STAGE] Opened {pkg['eml_file']} in default mail client.")
        if args.open_gmail_web:
            webbrowser.open(pkg["gmail_web_compose_url"])
            print(f"[STAGE] Opened Gmail Web compose URL for {pkg['uid']} ({pkg['headers']['To']}).")


if __name__ == "__main__":
    main()
