@echo off
:: validate-report.bat
:: Ryze Education — Report Pre-Export Validator (Windows launcher)
::
:: Usage:
::   validate-report "students/john-smith/John Smith - Progress Report.html"
::
:: Double-click or run from any terminal. Node.js must be installed.

node "%~dp0validate-report.mjs" %*
