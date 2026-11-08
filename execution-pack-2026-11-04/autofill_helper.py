#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
1-Click Portal Autofill & Clipboard/Playwright Helper for RADAR-261104-01..10
Usage:
  python autofill_helper.py --list
  python autofill_helper.py --target RADAR-261104-06 --copy-cover-letter
  python autofill_helper.py --target RADAR-261104-01 --open-portal
  python autofill_helper.py --target RADAR-261104-04 --open-eml
"""

from __future__ import annotations
import argparse
import json
import os
import subprocess
import webbrowser
from pathlib import Path

HERE = Path(__file__).resolve().parent
PAYLOAD_DIR = HERE / "payloads"
EML_DIR = HERE / "eml"


def load_payload(uid: str) -> dict:
    path = PAYLOAD_DIR / f"{uid}.json"
    if not path.exists():
        raise SystemExit(f"[ERROR] Payload not found: {path}")
    return json.loads(path.read_text(encoding="utf-8"))


def copy_to_clipboard(text: str) -> None:
    proc = subprocess.Popen(["clip"], stdin=subprocess.PIPE, shell=True)
    proc.communicate(input=text.encode("utf-16-le"))


def main() -> None:
    parser = argparse.ArgumentParser(description="Portal Autofill & Package Helper (2026-11-04)")
    parser.add_argument("--list", action="store_true", help="List all 10 staged targets")
    parser.add_argument("--target", type=str, help="Target UID (e.g. RADAR-261104-01)")
    parser.add_argument("--copy-cover-letter", action="store_true", help="Copy tailored cover letter to clipboard")
    parser.add_argument("--open-portal", action="store_true", help="Open official portal URL in default browser")
    parser.add_argument("--open-eml", action="store_true", help="Open RFC-822 .eml draft in mail client")
    args = parser.parse_args()

    if args.list or not args.target:
        for p in sorted(PAYLOAD_DIR.glob("RADAR-261104-*.json")):
            d = json.loads(p.read_text(encoding="utf-8"))
            print(f"{d['uid']} | Fit {d['fit_score']}/100 | {d['company']} — {d['role']}")
            print(f"   Portal : {d['portal_url']}")
            print(f"   EML    : {d['email_draft_package']['eml_path']}")
        return

    data = load_payload(args.target)
    fields = data["form_autofill_fields"]
    print(f"=== {data['uid']}: {data['company']} ===")
    print(f"Role          : {data['role']}")
    print(f"Portal URL    : {data['portal_url']}")
    print(f"Subject Line  : {fields['subject_line']}")
    print(f"Full Name     : {fields['full_name']} | NIK: {fields['nik']} | NIM: {fields['nim']}")
    print(f"Education     : {fields['major']} ({fields['concentration']}), {fields['university']}")
    print(f"GPA / SKS     : {fields['gpa']} / {fields['gpa_scale']} ({fields['total_sks']} SKS) | NIN: {fields['national_diploma_number_nin']}")
    print(f"Locked CV     : {fields['upload_files']['cv_file_path']}")
    print(f"Locked Ijazah : {fields['upload_files']['ijazah_file_path']}")

    if args.copy_cover_letter:
        copy_to_clipboard(fields["cover_letter_text"])
        print("[OK] Tailored cover letter copied to Windows clipboard!")

    if args.open_portal:
        webbrowser.open(data["portal_url"])
        print(f"[OK] Opened {data['portal_url']} in default browser.")

    if args.open_eml:
        eml_path = data["email_draft_package"]["eml_path"]
        os.startfile(eml_path)
        print(f"[OK] Launched .eml draft: {eml_path}")


if __name__ == "__main__":
    main()
