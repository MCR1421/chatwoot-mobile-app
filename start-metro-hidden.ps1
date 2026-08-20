$ErrorActionPreference = "Continue"
$logDir = "C:\dev\evo-mobile-app\.metro-logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir -Force | Out-Null }
$logFile = Join-Path $logDir "metro.log"
Set-Location "C:\dev\evo-mobile-app"
& npx expo start --port 8088 --dev-client *>> $logFile
