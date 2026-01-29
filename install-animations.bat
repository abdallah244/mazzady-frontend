@echo off
echo Installing @angular/animations...
cd /d "%~dp0"
npm install @angular/animations@^21.0.0 --legacy-peer-deps
echo.
echo Installation complete!
echo.
pause
