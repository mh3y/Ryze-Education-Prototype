@echo off
:: create-new-report.bat
:: Ryze Education — New Student Report Creator (Windows launcher)
::
:: Usage:
::   create-new-report "Jane Smith"
::   create-new-report              (interactive — will prompt for name)
::
:: Node.js must be installed.

node "%~dp0create-new-report.mjs" %*
