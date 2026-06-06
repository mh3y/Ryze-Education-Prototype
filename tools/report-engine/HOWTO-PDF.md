# How to Export a Report as PDF

## Method 1 — Browser print (recommended for now)

This is the standard workflow for generating PDFs from the current engine.

### Steps

1. Open `reports/Sienna Kim - Progress Report.html` (or any student report) in **Google Chrome** or **Microsoft Edge**.
2. The print dialog will open automatically (the `-print.html` version triggers this).
   - If using the main `.html` file, press `Cmd+P` (Mac) or `Ctrl+P` (Windows) manually.
3. In the print dialog:
   - **Destination:** Save as PDF
   - **Paper size:** A4
   - **Margins:** None
   - **Background graphics:** ✓ On (required for colours and backgrounds)
   - **Scale:** Default (100%)
4. Click **Save**.

### Recommended browser

Google Chrome produces the best PDF output for this report. Safari and Firefox may render some colours differently.

---

## Method 2 — Print-ready HTML file

The `-print.html` version of each report auto-opens the print dialog when loaded.

1. Open `Sienna Kim - Progress Report-print.html` in Chrome.
2. The print dialog opens automatically after the report renders.
3. Follow the settings above.

---

## Method 3 — Headless browser (for CRM / automated generation)

For automated PDF generation (e.g. from a CRM or API), use **Puppeteer** or **Playwright**.

### Puppeteer example

```js
const puppeteer = require('puppeteer');
const path = require('path');

async function generatePDF(reportHtmlPath, outputPdfPath) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Load the HTML file
  const fileUrl = 'file://' + path.resolve(reportHtmlPath);
  await page.goto(fileUrl, { waitUntil: 'networkidle0' });

  // Wait for the report engine to finish rendering
  await page.waitForFunction(() => {
    const pages = document.querySelectorAll('#report-root .page').length;
    const chart = document.querySelector('#trend polyline');
    return pages >= 3 && chart;
  }, { timeout: 10000 });

  // Wait for fonts
  await page.evaluateHandle(() => document.fonts.ready);

  // Generate PDF
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
    printBackground: true,
  });

  await browser.close();
  console.log('PDF saved to', outputPdfPath);
}

generatePDF(
  './reports/Sienna Kim - Progress Report.html',
  './exports/Sienna Kim - Progress Report.pdf'
);
```

### Install Puppeteer

```bash
npm install puppeteer
```

### Playwright alternative

```js
const { chromium } = require('playwright');

async function generatePDF(htmlPath, pdfPath) {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto('file://' + require('path').resolve(htmlPath));
  await page.waitForFunction(() =>
    document.querySelectorAll('#report-root .page').length >= 3
  );
  await page.pdf({ path: pdfPath, format: 'A4', printBackground: true });
  await browser.close();
}
```

---

## Important PDF settings

| Setting | Value | Why |
|---------|-------|-----|
| Paper size | A4 | Report is designed for A4 (210mm × 297mm) |
| Margins | None / 0 | Page margins are built into the CSS |
| Background graphics | On | Required for colours, rating cells, dials, stripe patterns |
| Scale | 100% | Do not scale — layout is pixel-precise |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Colours missing | Enable "Background graphics" in print settings |
| Text looks blurry | Use Chrome, not Safari |
| Fonts wrong | Ensure internet connection (Google Fonts are loaded remotely) — or use the standalone bundled HTML |
| Content clipped | Check margin is set to None, not Default |
| Pages incomplete | Wait longer before printing — the report renders asynchronously |

---

## Offline / standalone PDF

If you need to generate PDFs without an internet connection (e.g. no Google Fonts), use the standalone bundled HTML:

1. Run the bundler (or use the pre-bundled file `Sienna Kim - Progress Report (Standalone).html`).
2. Open it in Chrome.
3. Print to PDF as above.

The standalone file has all fonts, CSS, JS, and images inlined — no network requests needed.

---

*Ryze Education Report Engine — PDF Export Guide*
