@echo off
title Smart Attendance Server

cd /d "%~dp0"
echo Starting Smart Attendance
start "" http://localhost:3000

npm start

pause