@echo off
title Com CS - CentraleSupelec
echo ========================================================
echo   Lancement de Com CS (Nuxt.js + Tailwind CSS)
echo ========================================================
set "PATH=C:\Users\romai\tools\node;%PATH%"
cd /d "%~dp0"
echo Demarrage du serveur sur http://localhost:3000 ...
start http://localhost:3000
npm run dev
pause
