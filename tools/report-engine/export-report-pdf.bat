@echo off
:: export-report-pdf.bat
:: Ryze Education — Validated PDF Exporter (Windows launcher)
::
:: Usage:
::   export-report-pdf "students/jane-smith/Jane Smith - Progress Report.html"
::
:: Validates the report first. PDF is only exported if validation passes.
:: Node.js and puppeteer-core (in ~/.ryze-engine/) must be installed.

node "%~dp0export-report-pdf.mjs" %*
