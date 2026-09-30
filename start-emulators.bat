@echo off
title TeknikPro - Emulator Suite
echo Firebase Emulator baslatiliyor (Veriler otomatik yukleniyor ve kaydediliyor)...
firebase emulators:start --import=./emulator-data --export-on-exit
pause
