@echo off
cd /d "C:\Users\micha\OneDrive\Documents\GitHub\Ryze-Education-Prototype"
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "C:\Users\micha\.claude\hooks\claude-notify.ps1" %*
