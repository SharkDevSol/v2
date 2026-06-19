param(
  [string]$Server = $env:SSH_HOST,
  [string]$User = $env:SSH_USER,
  [string]$Password = $env:SSH_PASSWORD
)

if (-not $Server -or -not $Password) {
  Write-Host "`n========================================" -ForegroundColor Cyan
  Write-Host "  SKOOLIFIC FIX - AUTOMATED UPLOAD" -ForegroundColor Cyan
  Write-Host "========================================" -ForegroundColor Cyan
  Write-Host ""
  Write-Host "Set SSH_HOST, SSH_USER, and SSH_PASSWORD env vars first"
  Write-Host ""
  Write-Host "Example:"
  Write-Host '  $env:SSH_HOST="your-server-ip"'
  Write-Host '  $env:SSH_USER="root"'
  Write-Host '  $env:SSH_PASSWORD="your-password"'
  Write-Host "  .\auto_upload.ps1"
  exit 1
}

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  SKOOLIFIC FIX - AUTOMATED UPLOAD" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Step 1: Accept host key
Write-Host "[1/4] Accepting SSH host key..." -ForegroundColor Yellow
$acceptKey = @"
y
exit
"@
$acceptKey | plink -pw $Password ${User}@${Server} 2>&1 | Out-Null

# Step 2: Backup old dist
Write-Host "[2/4] Backing up old dist folder..." -ForegroundColor Yellow
$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$backupCmd = "cp -r /var/www/skoolific/iqrab3/APP/dist /var/www/skoolific/iqrab3/APP/dist-backup-$timestamp"
$cmd = @"echo '$Password' | plink -pw $Password ${User}@${Server} "$backupCmd"
"@
Invoke-Expression $cmd 2>&1 | Out-Null

# Step 3: Upload new build
Write-Host "[3/4] Uploading new build..." -ForegroundColor Yellow
pscp -pw $Password -r "APP\dist\*" ${User}@${Server}:/var/www/skoolific/iqrab3/APP/dist/ 2>&1 | Out-Null

# Step 4: Reload Nginx
Write-Host "[4/4] Reloading Nginx..." -ForegroundColor Yellow
plink -pw $Password ${User}@${Server} "systemctl reload nginx" 2>&1 | Out-Null

Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  UPLOAD COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:"
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)"
Write-Host "2. Refresh the application"
Write-Host "3. Verify the fix is working"
