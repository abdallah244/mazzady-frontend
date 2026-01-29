Write-Host "Installing @angular/animations..." -ForegroundColor Green
Set-Location $PSScriptRoot
npm install @angular/animations@^21.0.0 --legacy-peer-deps
Write-Host ""
Write-Host "Installation complete!" -ForegroundColor Green
Write-Host ""
Read-Host "Press Enter to exit"
