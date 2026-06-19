param(
  [string]$Server = $env:SSH_HOST,
  [string]$User = $env:SSH_USER,
  [string]$Password = $env:SSH_PASSWORD
)

if (-not $Server -or -not $Password) {
  Write-Host "❌ Set SSH_HOST, SSH_USER, and SSH_PASSWORD env vars first" -ForegroundColor Red
  exit 1
}

Write-Host "🚀 Deploying to $Server..." -ForegroundColor Green
$securePassword = ConvertTo-SecureString $Password -AsPlainText -Force
$credential = New-Object System.Management.Automation.PSCredential ($User, $securePassword)

Write-Host "📤 Uploading index.html..." -ForegroundColor Yellow
scp -o StrictHostKeyChecking=no APP/dist/index.html ${User}@${Server}:/var/www/skoolific/iqrab3/APP/dist/

Write-Host "🔄 Reloading Nginx..." -ForegroundColor Yellow
ssh ${User}@${Server} "systemctl reload nginx"

Write-Host "✅ Deployment complete!" -ForegroundColor Green
Write-Host "Clear browser cache (Ctrl+Shift+Delete) and refresh"
