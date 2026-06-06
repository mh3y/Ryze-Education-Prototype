@echo off
:: setup-report-engine.bat
:: Ryze Education — One-Time Machine Setup (Windows launcher)
::
:: Run this ONCE on each computer before using export-report-pdf.
:: It installs puppeteer-core to %USERPROFILE%\.ryze-engine\ (not Google Drive).
::
:: Usage:
::   setup-report-engine              normal first-time setup
::   setup-report-engine --force      reinstall even if already present

node "%~dp0setup-report-engine.mjs" %*
