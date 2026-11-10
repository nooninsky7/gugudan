@echo off
chcp 65001 > nul
title 구구단 탐험대 태블릿 연결 서버
echo.
echo [구구단 탐험대] 태블릿 연결용 로컬 서버를 시작합니다...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
