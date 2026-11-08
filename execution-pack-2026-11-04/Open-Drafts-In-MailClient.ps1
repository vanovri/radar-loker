#Requires -Version 5.1
<#
.SYNOPSIS
    1-Click RFC-822 .eml & Gmail Web Compose Launcher for RADAR-261104-01..10
    Generated on 2026-11-04 for Ardhya Novri Ramadhan, S.T.
    SAFETY RULE: Stages drafts only; NEVER dispatches live emails without explicit user click.

.EXAMPLE
    .\Open-Drafts-In-MailClient.ps1 -List
    .\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-01 -Mode Eml
    .\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-04 -Mode GmailWeb
    .\Open-Drafts-In-MailClient.ps1 -AllPending -Mode Eml
#>
param(
    [string]$Target = '',
    [ValidateSet('Eml', 'GmailWeb', 'Portal')][string]$Mode = 'Eml',
    [switch]$List,
    [switch]$AllPending
)

$ErrorActionPreference = 'Stop'
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ManifestPath = Join-Path $ScriptDir 'email_dispatch_manifest.json'
$Manifest = Get-Content -Raw -Encoding UTF8 $ManifestPath | ConvertFrom-Json
$DocsFolder = 'C:\Users\ardhy\OneDrive\Documents\My Docs'

if ($List -or (-not $Target -and -not $AllPending)) {
    Write-Host '=== STAGED RFC-822 EMAIL DRAFTS & PORTAL PACKAGES (2026-11-04) ===' -ForegroundColor Cyan
    foreach ($item in $Manifest.packages) {
        $statusTag = if ($item.evidence_status -eq 'A_SENT_VERIFIED') { '[PORTAL SENT]' } else { '[READY DRAFT]' }
        Write-Host ("{0} {1} | Fit {2}/100 | {3} — {4}" -f $item.uid, $statusTag, $item.fit_score, $item.company, $item.role)
        Write-Host ("    To      : {0}" -f $item.headers.To) -ForegroundColor Gray
        Write-Host ("    Subject : {0}" -f $item.headers.Subject) -ForegroundColor Gray
        Write-Host ("    EML     : {0} ({1:N0} bytes)" -f $item.eml_filename, $item.eml_size_bytes) -ForegroundColor DarkGray
    }
    Write-Host ''
    Write-Host 'Usage Examples:' -ForegroundColor Yellow
    Write-Host '  .\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-01 -Mode Eml'
    Write-Host '  .\Open-Drafts-In-MailClient.ps1 -Target RADAR-261104-04 -Mode GmailWeb'
    Write-Host '  .\Open-Drafts-In-MailClient.ps1 -AllPending -Mode Eml'
    exit 0
}

$Selected = @()
if ($AllPending) {
    $Selected = $Manifest.packages | Where-Object { $_.evidence_status -ne 'A_SENT_VERIFIED' }
} else {
    $Selected = $Manifest.packages | Where-Object { $_.uid -eq $Target }
    if (-not $Selected) {
        Write-Error "Target UID not found in manifest: $Target"
    }
}

foreach ($pkg in $Selected) {
    Write-Host ("==> Staging {0}: {1} ({2})" -f $pkg.uid, $pkg.company, $Mode) -ForegroundColor Green
    if ($Mode -eq 'Eml') {
        Start-Process -FilePath $pkg.eml_file
        Start-Sleep -Milliseconds 600
    } elseif ($Mode -eq 'GmailWeb') {
        Set-Clipboard -Value $DocsFolder
        Write-Host "    [Clipboard] Copied locked docs folder path: $DocsFolder" -ForegroundColor Yellow
        Start-Process $pkg.gmail_web_compose_url
        Start-Sleep -Milliseconds 800
    } elseif ($Mode -eq 'Portal') {
        Start-Process $pkg.portal_url
        Start-Sleep -Milliseconds 600
    }
}
