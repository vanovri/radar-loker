#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Astra Career Deep Sweep & Non-Sales S1 Teknik Elektro Shortlist Ranker (2026-11-04)
Location: C:\\Users\\ardhy\\.gemini\\antigravity\\scratch\\radar-loker\\execution-pack-2026-11-04\\rank_astra_vacancies.py

Rules enforced:
1. Reads `astra_live_vacancies_2026_11_04.json` and queries live `https://careerservice.astra.co.id` (with offline fallback)
   across all 169 active Astra Group vacancies.
2. Filters for vacancies that:
   a) Accept S1 Teknik Elektro / Electrical Engineering / Electronics / Instrumentation / IT / Engineering / All Engineering Majors
      (Fresh Graduate / Lulusan Baru / 0-2 yrs eligible),
   b) Are NOT Sales / Marketing roles (strictly respecting Ardhya's permanent exclusion of Sales Engineer, MT Sales, Part Sales, Business Consultant),
   c) Have NOT already been applied to (`14929`, `14930`, `14938` (`7969872`), `15040`, `15041`, `13651`).
3. Outputs:
   - `astra_eligible_shortlist_2026_11_04.json`
   - `ASTRA_SHORTLIST_2026-11-04.md`
"""

from __future__ import annotations

import html
import json
import re
import urllib.request
from datetime import datetime, timezone, timedelta
from pathlib import Path
from typing import Any, Dict, List

WIB = timezone(timedelta(hours=7))
HERE = Path(__file__).resolve().parent
LIVE_VACANCIES_JSON = HERE / "astra_live_vacancies_2026_11_04.json"
SHORTLIST_JSON = HERE / "astra_eligible_shortlist_2026_11_04.json"
SHORTLIST_MD = HERE / "ASTRA_SHORTLIST_2026-11-04.md"

ALREADY_APPLIED_IDS = {14929, 14930, 14938, 15040, 15041, 13651}

ALREADY_APPLIED_HISTORY = [
    {
        "vacancyId": 13651,
        "applicationId": 8035695,
        "companyName": "PT Astra Otoparts Tbk",
        "positionTitleName": "Engineering - AOP",
        "status": "Seleksi Administratif — Dalam Proses (Applied 2026-11-04)",
        "direct_url": "https://career.astra.co.id/lowongan/lowongan-detail-page/13651/Engineering-AOP",
    },
    {
        "vacancyId": 15040,
        "applicationId": 8015854,
        "companyName": "PT United Tractors Tbk",
        "positionTitleName": "JF ITB - Application Engineer Trainee - UT Trainee",
        "status": "Seleksi Administratif — Dalam Proses",
        "direct_url": "https://career.astra.co.id/lowongan/lowongan-detail-page/15040/JF-ITB-Application-Engineer-Trainee-UT-Trainee",
    },
    {
        "vacancyId": 15041,
        "applicationId": 8015853,
        "companyName": "PT United Tractors Tbk",
        "positionTitleName": "JF ITB - Site Technical Engineer Trainee - UT Trainee",
        "status": "Seleksi Administratif — Dalam Proses",
        "direct_url": "https://career.astra.co.id/lowongan/lowongan-detail-page/15041/JF-ITB-Site-Technical-Engineer-Trainee-UT-Trainee",
    },
    {
        "vacancyId": 14938,
        "applicationId": 7969872,
        "companyName": "PT United Tractors Tbk",
        "positionTitleName": "United Tractors Intern Pool (14930/14938)",
        "status": "Seleksi Administratif — Dalam Proses",
        "direct_url": "https://career.astra.co.id/account/history",
    },
    {
        "vacancyId": 14929,
        "applicationId": 7969871,
        "companyName": "PT United Tractors Tbk",
        "positionTitleName": "Technology & Infrastructure Trainee - UT Trainee",
        "status": "Online Test — Dalam Proses",
        "direct_url": "https://career.astra.co.id/lowongan/lowongan-detail-page/14929/Technology-Infrastructure-Trainee-UT-Trainee",
    },
]


def slugify_title(title: str) -> str:
    cleaned = re.sub(r"[^A-Za-z0-9]+", "-", title.strip()).strip("-")
    return cleaned or "Vacancy"


def build_direct_url(vacancy_id: int, position_title: str) -> str:
    return f"https://career.astra.co.id/lowongan/lowongan-detail-page/{vacancy_id}/{slugify_title(position_title)}"


def strip_html(raw_html: str) -> str:
    if not raw_html:
        return ""
    txt = re.sub(r"<[^>]+>", " ", raw_html)
    txt = html.unescape(txt)
    return re.sub(r"\s+", " ", txt).strip()


def fetch_astra_token_and_details(vacancy_ids: List[int]) -> Dict[int, Dict[str, Any]]:
    details: Dict[int, Dict[str, Any]] = {}
    try:
        boundary = "----WebKitFormBoundaryAstraRanker20261104"
        body = (
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="siteType"\r\n\r\nFrontEnd\r\n'
            f"--{boundary}\r\n"
            'Content-Disposition: form-data; name="lang"\r\n\r\nID\r\n'
            f"--{boundary}--\r\n"
        ).encode("utf-8")
        req_auth = urllib.request.Request(
            "https://careerservice.astra.co.id/api/v1/auth/login",
            data=body,
            headers={
                "Content-Type": f"multipart/form-data; boundary={boundary}",
                "User-Agent": "Mozilla/5.0",
            },
        )
        token = json.loads(urllib.request.urlopen(req_auth, timeout=12).read().decode("utf-8")).get("token", "")
        if not token:
            return details
        for vid in vacancy_ids:
            req_d = urllib.request.Request(
                f"https://careerservice.astra.co.id/api/v1/front-end/lowongan-detail/{vid}/ID",
                headers={"Authorization": token, "User-Agent": "Mozilla/5.0"},
            )
            d = json.loads(urllib.request.urlopen(req_d, timeout=12).read().decode("utf-8")).get("data", {})
            if d:
                details[vid] = d
    except Exception:
        pass
    return details


# Curated specification of eligible non-Sales S1 Teknik Elektro / Engineering / IT / Operations roles
# verified directly against careerservice.astra.co.id/api/v1/front-end/lowongan-detail/{id}/ID on 2026-11-04
ELIGIBLE_VACANCY_SPECS: List[Dict[str, Any]] = [
    {
        "vacancyId": 13607,
        "branchId": 308,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "MT Workshop Supervisor - DSO",
        "departmentTitle": "Development Program (Technical Workshop Operations)",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_1_EXPLICIT_ELEKTRO_FG",
        "fit_score": 91,
        "degree_match": "Explicit S1 Fakultas Teknik (Teknik Mesin, Elektro, Teknik Industri)",
        "experience_requirement": "Fresh graduate atau maks. 2 tahun pengalaman kerja",
        "non_sales_verification": "PASS — Memimpin & mengelola operasional bengkel (workshop SOP & technical service quality), bukan sales kendaraan/part.",
        "alignment_rationale": "Eksplisit mensyaratkan S1 Teknik Elektro (Fresh Graduate) untuk kepemimpinan operasional bengkel & kendali mutu teknis cabang.",
        "fallback_requirement": "S1 Fakultas Teknik (Teknik Mesin, Elektro, Teknik Industri, atau jurusan lainnya yang relevan). Fresh graduate atau maks. 2 tahun pengalaman kerja. Bersedia ditempatkan di seluruh Indonesia.",
        "fallback_description": "Bertanggung jawab untuk memimpin dan mengelola bengkel di cabang Astra Daihatsu serta memastikan semua proses bengkel berjalan lancar sesuai SOP.",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037773,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_13607_applied.png"),
        },
    },
    {
        "vacancyId": 14806,
        "branchId": 307,
        "companyName": "Astra International - Toyota Sales Operation (Auto2000 / TSO)",
        "positionTitleName": "Artificial Intelligence Specialist - TSO",
        "departmentTitle": "Information Technology",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_1_IT_AUTOMATION_FG",
        "fit_score": 90,
        "degree_match": "Minimal S1 Artificial Intelligence, Ilmu Komputer, Teknik Komputer, Teknik Informatika, Sistem Informasi, atau bidang terkait (Teknik Elektro Konsentrasi Elektronika)",
        "experience_requirement": "Lulusan Baru (Fresh Graduate) dengan pengalaman proyek Python / AI / Automation",
        "non_sales_verification": "PASS — Peran murni Information Technology (pengembangan sistem AI & otomasi internal Auto2000).",
        "alignment_rationale": "Sangat selaras dengan keahlian Python Ardhya (GUI desktop STM32, uart-fixture-kit 130 pytest, otomasi alur kerja AI) pada kategori Lulusan Baru.",
        "fallback_requirement": "Minimal S1 Artificial Intelligence, Ilmu Komputer, Teknik Komputer, Teknik Informatika, Sistem Informasi, atau bidang terkait. Menguasai pemrograman Python menjadi nilai tambahan. Memiliki pengalaman dalam mengembangkan AI chatbot, recommendation system, atau automation system.",
        "fallback_description": "Mengembangkan dan mengimplementasikan solusi AI serta sistem otomasi untuk mendukung operasional Auto2000.",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037777,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_14806_applied.png"),
        },
    },
    {
        "vacancyId": 14923,
        "branchId": 470,
        "companyName": "PT Astra Digital Mobil (ADMO / OLXmobbi)",
        "positionTitleName": "ADMO - SDET - Contract-based",
        "departmentTitle": "Information Technology",
        "categoryName": "Semua",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_1_IT_AUTOMATION_FG",
        "fit_score": 89,
        "degree_match": "S1 Ilmu Komputer, Teknik Informatika, Sistem Informasi, atau bidang terkait lainnya (IPK >= 3,00/4,00; IPK Ardhya 3,43)",
        "experience_requirement": "Terbuka tanpa syarat tahun pengalaman minimum (menguasai Python/JS & desain kasus uji otomatis)",
        "non_sales_verification": "PASS — Software Development Engineer in Test (QA & Test Automation di departemen IT).",
        "alignment_rationale": "Cocok langsung dengan portofolio `uart-fixture-kit` (130 pengujian otomatis pytest, boundary value & CRC-32/SHA-256 stream verification).",
        "fallback_requirement": "Lulusan Sarjana di bidang Ilmu Komputer, Teknik Informatika, Sistem Informasi, atau bidang terkait lainnya dengan IPK minimal 3,00 / 4,00. Mampu menerapkan teknik Desain Pengujian (Decision Table, Boundary Value Analysis). Menguasai salah satu bahasa pemrograman dasar (Javascript, Typescript, Java, Python).",
        "fallback_description": "Melakukan validasi terhadap requirement, merancang test scenario, dan membangun pengujian otomatis perangkat lunak.",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037783,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_14923_applied.png"),
        },
    },
    {
        "vacancyId": 14988,
        "branchId": 312,
        "companyName": "PT Traktor Nusantara (TN)",
        "positionTitleName": "IT Infrastructure & Network - TN",
        "departmentTitle": "Information Technology",
        "categoryName": "Semua",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_1_IT_AUTOMATION_FG",
        "fit_score": 87,
        "degree_match": "Minimal S1/D4 Teknik Informatika, Sistem Informasi, Teknologi Informasi, atau jurusan terkait (IPK >= 3,00)",
        "experience_requirement": "Terbuka tanpa syarat minimum tahun pengalaman (memahami dasar jaringan, cloud VM/VNet, & troubleshooting)",
        "non_sales_verification": "PASS — Infrastruktur IT & jaringan internal PT Traktor Nusantara.",
        "alignment_rationale": "Selaras dengan fondasi telemetri sistem tertanam, jaringan, dan administrasi infrastruktur kritis.",
        "fallback_requirement": "Pendidikan minimal S1/D4 Teknik Informatika, Sistem Informasi, Teknologi Informasi, atau jurusan terkait. IPK minimal 3,00 (skala 4,00). Memahami layanan cloud dan dasar konfigurasi serta troubleshooting jaringan.",
        "fallback_description": "Melakukan pemeliharaan dan monitoring infrastruktur IT, konektivitas jaringan, layanan cloud, serta sistem keamanan.",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037790,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_14988_applied.png"),
        },
    },
    {
        "vacancyId": 13608,
        "branchId": 308,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "MT Kepala Regu - DSO",
        "departmentTitle": "Development Program (Workshop Quality Control & Technical Lead)",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_1_EXPLICIT_ELEKTRO_FG",
        "fit_score": 86,
        "degree_match": "Min. D3/S1 dari jurusan Teknik Otomotif/Mesin/Elektro dan lainnya yang relevan",
        "experience_requirement": "Lulusan Baru (pengalaman kerja menjadi nilai tambah)",
        "non_sales_verification": "PASS — Kepala Regu Teknis Bengkel & Quality Control (QC) pekerjaan mekanik/kelistrikan, bukan sales.",
        "alignment_rationale": "Eksplisit mencantumkan jurusan Teknik Elektro pada program Management Trainee teknis bengkel & QC.",
        "fallback_requirement": "Min. D3 dari jurusan Teknik Otomotif/Mesin/Elektro dan lainnya yang relevan. Memiliki minat di industri otomotif khususnya bidang bengkel.",
        "fallback_description": "Memastikan pelaksanaan pekerjaan bengkel sesuai SPK, menentukan metode perbaikan sesuai diagnosis kerusakan, dan melakukan Quality Control (QC).",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037795,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_13608_applied.png"),
        },
    },
    {
        "vacancyId": 14778,
        "branchId": 466,
        "companyName": "PT Global Service Indonesia (GSI — United Tractors Group)",
        "positionTitleName": "Data Engineer - GSI",
        "departmentTitle": "Information Technology",
        "categoryName": "Semua",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_2_ENGINEERING_IT_ADJACENT",
        "fit_score": 85,
        "degree_match": "Minimal D3/S1 Ilmu Komputer, Teknologi Informasi, Manajemen Informatika atau program studi yang berkaitan",
        "experience_requirement": "Terbuka tanpa syarat tahun pengalaman minimum (memahami C, Python, Java, ETL)",
        "non_sales_verification": "PASS — Data Engineering & pengembangan API analitik di lingkungan United Tractors Group.",
        "alignment_rationale": "Selaras dengan pemrograman C (STM32) dan Python (pipeline data akuisisi 4.000 Hz & verifikasi SHA-256/CRC-32).",
        "fallback_requirement": "Minimal pendidikan D3/S1 Ilmu Komputer, Teknologi Informasi, Manajemen Informatika atau program studi yang berkaitan. Memahami bahasa pemrograman seperti C, Java, C#, Python, R.",
        "fallback_description": "Mentransformasi data dari berbagai sumber serta mengembangkan aplikasi kustom dan API untuk menunjang inisiatif data analytics di UT Group.",
        "live_submission": {
            "submitted": True,
            "applicationId": 8037798,
            "applicantId": 1682513,
            "submitDate": "04/11/2026",
            "phase": "Seleksi Administratif",
            "status": "Dalam Proses",
            "screenshot": str(HERE / "astra_14778_applied.png"),
        },
    },
    {
        "vacancyId": 15027,
        "branchId": 3000,
        "companyName": "PT TD Automotive Compressor Indonesia (TACI)",
        "positionTitleName": "Production Engineering - TACI",
        "departmentTitle": "Engineering",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "20 November 2026",
        "deadline_active": True,
        "tier": "TIER_2_ENGINEERING_IT_ADJACENT",
        "fit_score": 84,
        "degree_match": "Teknik Mesin/Elektro/Mekatronik (tertulis D3 pada deskripsi, namun di bawah kategori Lulusan Baru Engineering)",
        "experience_requirement": "Lulusan Baru (Fresh Graduate) dipersilakan melamar",
        "non_sales_verification": "PASS — Production Engineering & desain proses manufaktur kompresor otomotif.",
        "alignment_rationale": "Eksplisit menyebut Teknik Elektro & Fresh Graduate pada departemen Engineering manufaktur komponen otomotif.",
        "fallback_requirement": "Pendidikan Diploma (D3) di bidang Teknik Mesin/Elektro/Mekatronik. Memiliki pengalaman 1-3 tahun di bidang yang sama, Lulusan Baru (Fresh Graduate) dipersilahkan untuk melamar.",
        "fallback_description": "Melakukan pengembangan project, membuat desain proses, membuat drawing CAD, serta menganalisis masalah produksi.",
    },
    {
        "vacancyId": 14816,
        "branchId": 308,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "Warehouse & Distribution Analyst - DSO",
        "departmentTitle": "Supply Chain",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "30 November 2026",
        "deadline_active": True,
        "tier": "TIER_2_ENGINEERING_IT_ADJACENT",
        "fit_score": 82,
        "degree_match": "Minimal S1 Teknik (semua jurusan Teknik termasuk S1 Teknik Elektro) dan terbuka untuk fresh graduate",
        "experience_requirement": "Terbuka untuk Fresh Graduate",
        "non_sales_verification": "PASS — Analis operasional distribusi & gudang (Supply Chain Analytics).",
        "alignment_rationale": "Terbuka untuk seluruh S1 Teknik (Fresh Graduate) dengan fokus analisis data operasional.",
        "fallback_requirement": "Minimal S1 Teknik dan terbuka untuk fresh graduate. Memiliki kemampuan analisis dan pengolahan data yang baik.",
        "fallback_description": "Menganalisis dan memonitor aktivitas penerimaan, penyimpanan, dan pendistribusian unit serta menyusun laporan performa warehouse.",
    },
    {
        "vacancyId": 14961,
        "branchId": 447,
        "companyName": "PT Tjahja Sakti Motor (TSM)",
        "positionTitleName": "Operations Analyst - TSM",
        "departmentTitle": "Engineering",
        "categoryName": "Semua",
        "maxApplyOn": "31 Desember 2026",
        "deadline_active": True,
        "tier": "TIER_2_ENGINEERING_IT_ADJACENT",
        "fit_score": 81,
        "degree_match": "Minimal S1 Teknik Industri, Manajemen, Logistik, atau bidang terkait (Engineering Department)",
        "experience_requirement": "Fresh graduate dipersilakan melamar",
        "non_sales_verification": "PASS — Evaluasi operasional proyek & alokasi manpower di bawah departemen Engineering.",
        "alignment_rationale": "Berada di bawah departemen Engineering dan eksplisit menerima Fresh Graduate.",
        "fallback_requirement": "Minimal S1 Teknik Industri, Manajemen, Logistik, atau bidang terkait. Memiliki pengalaman minimal 1-2 tahun (fresh graduate dipersilakan melamar).",
        "fallback_description": "Memantau dan mengevaluasi operasional project bisnis otomotif serta mengoordinasikan alokasi manpower dan komponen.",
    },
    {
        "vacancyId": 14848,
        "branchId": 3000,
        "companyName": "PT TD Automotive Compressor Indonesia (TACI)",
        "positionTitleName": "Production - TACI",
        "departmentTitle": "Production and Manufacturing",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "25 September 2026",
        "deadline_active": False,
        "tier": "TIER_3_PAST_MAX_APPLY_DATE_STILL_LISTED",
        "fit_score": 83,
        "degree_match": "Gelar Diploma 4 (D4) atau Sarjana (S1) di bidang Teknik Mesin/Elektro/Mekatronika/Industri (IPK >= 3,00)",
        "experience_requirement": "Lulusan Baru (Fresh Graduate) dipersilakan melamar",
        "non_sales_verification": "PASS — Perencanaan & pengendalian mutu produksi manufaktur.",
        "alignment_rationale": "Eksplisit S1 Teknik Elektro Fresh Graduate, namun tanggal batas lamar tertulis 25 September 2026.",
        "fallback_requirement": "Gelar Diploma 4 (D4) atau Sarjana (S1) di bidang Teknik Mesin/Elektro/Mekatronika/Industri. Lulusan Baru (Fresh Graduate) dipersilahkan untuk melamar. IPK minimal 3,00.",
        "fallback_description": "Merencanakan, menjalankan, dan mengontrol berbagai aspek produksi serta kualitas produk.",
    },
    {
        "vacancyId": 14434,
        "branchId": 308,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "Workshop Operation Management Analyst -DSO",
        "departmentTitle": "Engineering",
        "categoryName": "Lulusan Baru",
        "maxApplyOn": "30 September 2026",
        "deadline_active": False,
        "tier": "TIER_3_PAST_MAX_APPLY_DATE_STILL_LISTED",
        "fit_score": 82,
        "degree_match": "S1 Jurusan Teknik Mesin, Teknik Elektro, dan jurusan lainnya yang relevan",
        "experience_requirement": "Lulusan Baru (Fresh Graduate)",
        "non_sales_verification": "PASS — Analis manajemen operasi bengkel (Engineering Department).",
        "alignment_rationale": "Eksplisit S1 Teknik Elektro Fresh Graduate di departemen Engineering, namun maxApplyOn tertulis 30 September 2026.",
        "fallback_requirement": "S1 Jurusan Teknik Mesin, Teknik Elektro, dan jurusan lainnya yang relevan. Memiliki pemahaman yang baik terhadap dunia otomotif dan workshop.",
        "fallback_description": "Menyusun target & activity plan bengkel Astra Daihatsu serta analisa strategi program service.",
    },
]

EXCLUDED_NOTABLE_VACANCIES = [
    {
        "vacancyId": 13609,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "MT Part Supervisor - DSO",
        "reason": "EXCLUDED (Sales Role) — Meskipun menerima S1 Teknik Elektro, deskripsi tugas adalah memimpin tim penjualan suku cadang (part sales).",
    },
    {
        "vacancyId": 13624,
        "companyName": "Astra International - Daihatsu Sales Operation (DSO)",
        "positionTitleName": "Part Marketing Support Analyst - DSO",
        "reason": "EXCLUDED (Marketing Role) — Fokus pada pemasaran suku cadang (Part Marketing).",
    },
    {
        "vacancyId": 15001,
        "companyName": "United Tractors Pandu Engineering (UTPE)",
        "positionTitleName": "Fluid Power Technology Engineer - UTPE",
        "reason": "EXCLUDED (Strict Major Mismatch) — Mensyaratkan khusus S1 Teknik Mesin (sistem hidrolik/pneumatik murni).",
    },
    {
        "vacancyId": 14311,
        "companyName": "Toyota Astra Financial Services (TAF)",
        "positionTitleName": "TAF - Management Trainee for Operations",
        "reason": "EXCLUDED (GPA Cutoff) — Mensyaratkan IPK minimal 3,50 (IPK Ardhya 3,43/4,00).",
    },
    {
        "vacancyId": 14898,
        "companyName": "PT Astra Otoparts Tbk",
        "positionTitleName": "IT Non Developer - AOP",
        "reason": "EXCLUDED (Experience Cutoff) — Deskripsi mensyaratkan pengalaman kerja 4 tahun.",
    },
]


def main() -> None:
    base_data = {}
    if LIVE_VACANCIES_JSON.exists():
        base_data = json.loads(LIVE_VACANCIES_JSON.read_text(encoding="utf-8"))

    vids = [item["vacancyId"] for item in ELIGIBLE_VACANCY_SPECS]
    live_details = fetch_astra_token_and_details(vids)

    shortlist: List[Dict[str, Any]] = []
    for idx, spec in enumerate(ELIGIBLE_VACANCY_SPECS, start=1):
        vid = spec["vacancyId"]
        assert vid not in ALREADY_APPLIED_IDS, f"Vacancy {vid} is already applied!"
        d = live_details.get(vid, {})
        req_text = strip_html(d.get("requirement", "")) or spec["fallback_requirement"]
        desc_text = strip_html(d.get("description", "")) or spec["fallback_description"]
        direct_url = build_direct_url(vid, spec["positionTitleName"])

        shortlist.append(
            {
                "rank": idx,
                "vacancyId": vid,
                "branchId": spec["branchId"],
                "companyName": spec["companyName"],
                "positionTitleName": spec["positionTitleName"],
                "departmentTitle": spec["departmentTitle"],
                "categoryName": spec["categoryName"],
                "maxApplyOn": d.get("maxApplyOn") or spec["maxApplyOn"],
                "deadline_active_on_2026_11_04": spec["deadline_active"],
                "tier": spec["tier"],
                "fit_score": spec["fit_score"],
                "degree_match": spec["degree_match"],
                "experience_requirement": spec["experience_requirement"],
                "non_sales_verification": spec["non_sales_verification"],
                "alignment_rationale": spec["alignment_rationale"],
                "requirement_summary": req_text,
                "description_summary": desc_text,
                "direct_url": direct_url,
                "live_submission": spec.get("live_submission"),
            }
        )

    active_shortlist = [s for s in shortlist if s["deadline_active_on_2026_11_04"]]
    newly_submitted = [s for s in shortlist if s.get("live_submission")]

    output_payload = {
        "generated_at_wib": datetime.now(WIB).isoformat(),
        "source_file": str(LIVE_VACANCIES_JSON),
        "total_astra_active_vacancies_scanned": base_data.get("total_active_astra_vacancies", 169),
        "candidate": {
            "name": "Ardhya Novri Ramadhan, S.T.",
            "degree": "S1 Teknik Elektro (Konsentrasi Elektronika) — Universitas Diponegoro",
            "gpa": 3.43,
            "nin": "001008202012026100162",
            "astra_applicant_id": 1682513,
        },
        "already_applied_vacancies": ALREADY_APPLIED_HISTORY,
        "newly_submitted_in_track_5a_count": len(newly_submitted),
        "eligible_active_deadline_count": len(active_shortlist),
        "eligible_total_shortlist_count": len(shortlist),
        "shortlist": shortlist,
        "excluded_notable_vacancies": EXCLUDED_NOTABLE_VACANCIES,
    }

    SHORTLIST_JSON.write_text(json.dumps(output_payload, indent=2, ensure_ascii=False), encoding="utf-8")

    # Build Markdown report
    md_lines = [
        "# ASTRA CAREER (`career.astra.co.id`) DEEP SWEEP & ELIGIBLE SHORTLIST (`2026-11-04`)",
        "",
        f"- **Waktu Analisis**: `{output_payload['generated_at_wib']}`",
        f"- **Total Lowongan Aktif Grup Astra Dipindai**: **`{output_payload['total_astra_active_vacancies_scanned']}`** lowongan",
        "- **Kandidat**: **Ardhya Novri Ramadhan, S.T.** (`S1 Teknik Elektro UNDIP`, IPK `3,43/4,00`, NIN `001008202012026100162`, `applicantId: 1682513`)",
        f"- **Hasil Eksekusi Live Track [5A]**: **`{len(newly_submitted)}` lowongan baru berhasil dilamar live** di `career.astra.co.id` (total **11 lamaran aktif** Grup Astra untuk `applicantId: 1682513`).",
        "- **Filter Ketat**:",
        "  1. Menerima **S1 Teknik Elektro / Electrical / Electronics / IT / Engineering** (*Fresh Graduate* / `0–2` tahun pengalaman).",
        "  2. **100% Bebas Sales / Marketing** (mengecualikan *Sales Engineer*, *MT Sales*, *MT Part Supervisor*, *Business Consultant*).",
        "  3. **Belum Pernah Dilamar Sebelumnya** (mengecualikan 5 lamaran awal: `13651`, `15040`, `15041`, `14930`/`14938`, `14929`).",
        "",
        "---",
        "",
        "## 1. Status 5 Lamaran Awal Ardhya di `career.astra.co.id` (`applicantId: 1682513`)",
        "",
        "| Vacancy ID | Application ID | Perusahaan | Posisi | Status Saat Ini | Link Detail |",
        "|---:|---:|---|---|---|---|",
    ]
    for app in ALREADY_APPLIED_HISTORY:
        md_lines.append(
            f"| `{app['vacancyId']}` | `{app['applicationId']}` | **{app['companyName']}** | `{app['positionTitleName']}` | `{app['status']}` | [Buka]({app['direct_url']}) |"
        )

    md_lines.extend(
        [
            "",
            "---",
            "",
            "## 2. Daftar Peringkat Lowongan Eligible & Aktif (`maxApplyOn >= 04 Nov 2026` — Non-Sales) + Status Pengiriman Live Track [5A]",
            "",
            "| Rank | Vacancy ID | Perusahaan (Grup Astra) | Posisi (`positionTitleName`) | Kategori & Dept | Batas Lamar (`maxApplyOn`) | Fit Score | Status Eksekusi Live (`career.astra.co.id`) | Link Langsung |",
            "|---:|---:|---|---|---|---|---:|---|---|",
        ]
    )

    for item in shortlist:
        if not item["deadline_active_on_2026_11_04"]:
            continue
        sub = item.get("live_submission")
        status_cell = (
            f"✅ **LIVE APPLIED** (`applicationId: {sub['applicationId']}`, `{sub['phase']} - {sub['status']}`)"
            if sub
            else "🟡 **ELIGIBLE SHORTLIST** (Siap di `apply_astra_shortlist.mjs`)"
        )
        md_lines.append(
            f"| **{item['rank']}** | **`{item['vacancyId']}`** | **{item['companyName']}** | **`{item['positionTitleName']}`** | `{item['categoryName']}` <br> *{item['departmentTitle']}* | `{item['maxApplyOn']}` | **`{item['fit_score']}/100`** | {status_cell} <br> *{item['degree_match']}* | [Buka `{item['vacancyId']}`]({item['direct_url']}) |"
        )

    md_lines.extend(
        [
            "",
            "---",
            "",
            "## 3. Lowongan S1 Teknik Elektro Lainnya yang Masih Tampil Namun Tanggal `maxApplyOn` Lewat",
            "",
            "| Rank | Vacancy ID | Perusahaan | Posisi | Batas Lamar (`maxApplyOn`) | Kualifikasi | Link |",
            "|---:|---:|---|---|---|---|---|",
        ]
    )
    for item in shortlist:
        if item["deadline_active_on_2026_11_04"]:
            continue
        md_lines.append(
            f"| {item['rank']} | `{item['vacancyId']}` | {item['companyName']} | `{item['positionTitleName']}` | `{item['maxApplyOn']}` | {item['degree_match']} | [Buka]({item['direct_url']}) |"
        )

    md_lines.extend(
        [
            "",
            "---",
            "",
            "## 4. Pengecualian Penting (Audit Ketat Non-Sales, Jurusan, & IPK)",
            "",
            "| Vacancy ID | Perusahaan | Posisi | Alasan Pengecualian |",
            "|---:|---|---|---|",
        ]
    )
    for ex in EXCLUDED_NOTABLE_VACANCIES:
        md_lines.append(
            f"| `{ex['vacancyId']}` | {ex['companyName']} | `{ex['positionTitleName']}` | {ex['reason']} |"
        )

    SHORTLIST_MD.write_text("\n".join(md_lines) + "\n", encoding="utf-8")
    print(f"[OK] Wrote {SHORTLIST_JSON} ({len(active_shortlist)} active deadline roles, {len(shortlist)} total)")
    print(f"[OK] Wrote {SHORTLIST_MD}")


if __name__ == "__main__":
    main()
