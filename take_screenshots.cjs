const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewports = [
  { width: 320, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 430, height: 932 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 }
];

const TARGET_URL = 'http://localhost:3003/maths-tutoring';
const OUT_DIR = 'C:\\Users\\hwcya\\.gemini\\antigravity\\brain\\1ca3c494-9408-45c9-822d-62d594f6b418';

(async () => {
  console.log('Launching Puppeteer...');
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.goto(TARGET_URL, { waitUntil: 'networkidle0' });

  for (const vp of viewports) {
    console.log(`Taking screenshot for ${vp.width}x${vp.height}...`);
    await page.setViewport({ width: vp.width, height: vp.height, deviceScaleFactor: 1 });
    // Scroll a bit to trigger any lazy loading
    await page.evaluate(() => window.scrollTo(0, 1000));
    await new Promise(r => setTimeout(r, 500));
    await page.evaluate(() => window.scrollTo(0, 0));
    
    // Disable CSS animations for consistent screenshots
    await page.evaluate(() => {
      const style = document.createElement('style');
      style.innerHTML = `* { transition: none !important; animation: none !important; }`;
      document.head.appendChild(style);
    });

    const fileName = `screenshot_${vp.width}.png`;
    const filePath = path.join(OUT_DIR, fileName);
    
    await page.screenshot({ path: filePath, fullPage: true });
    console.log(`Saved ${fileName}`);
  }

  await browser.close();
  console.log('Done.');
})();
