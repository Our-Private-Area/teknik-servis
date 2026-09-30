@echo off
title TeknikPro - Tum Servisleri Baslat
echo ========================================================
echo        TeknikPro Servisleri Baslatiliyor
echo ========================================================
echo.

echo [1/3] Firebase Emulator Suite baslatiliyor...
start "TeknikPro - Firebase Emulators" cmd /k "firebase emulators:start --import=./emulator-data --export-on-exit"

echo Emülatörün dinlemeye baslamasi icin 5 saniye bekleniyor...
timeout /t 5 /nobreak >nul

echo [2/3] Backend (.NET API) baslatiliyor...
start "TeknikPro - Backend (.NET)" cmd /k "cd backend\TeknikPro.API && dotnet run"

echo Backend icin 3 saniye bekleniyor...
timeout /t 3 /nobreak >nul

echo [3/3] Frontend (React / Vite) baslatiliyor...
start "TeknikPro - Frontend (Vite)" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================================
echo  Tum servisler ayri pencerelerde baslatildi!
echo  - Firebase UI : http://localhost:4000
echo  - Frontend    : http://localhost:3000
echo ========================================================
timeout /t 4 >nul
