@echo off
title Cerata Gestion - Demarrage
color 1F
echo.
echo  ============================================
echo    CERATA GESTION - Demarrage en cours...
echo  ============================================
echo.

cd /d "%~dp0"

echo  Installation des dependances...
call npm install --silent

echo.
echo  Demarrage du serveur...
echo.
echo  ============================================
echo    Application prete!
echo    Ouvrez votre navigateur et allez a:
echo    http://localhost:3000
echo  ============================================
echo.
echo  Connexion: info@cerata.ca / Cerata2024!
echo.

start "" "http://localhost:3000"
node server.js

pause
