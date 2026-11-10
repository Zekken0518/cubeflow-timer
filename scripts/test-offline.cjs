// Usage: node scripts/test-offline.cjs <path-to-playwright> [chrome-executable]
const { chromium } = require(process.argv[2] || 'playwright');
const { createServer } = require('node:http');
const { readFileSync } = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');

(async () => {
  const server = createServer((req, res) => {
    let name = decodeURIComponent(new URL(req.url, 'http://localhost').pathname).replace(/^\/cubeflow\//, '/');
    if (name === '/') name = '/index.html';
    const file = path.resolve('.' + name);
    if (!file.startsWith(process.cwd() + path.sep)) { res.writeHead(403).end(); return; }
    try {
      const content = readFileSync(file);
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.ttf': 'font/ttf' })[path.extname(file)] || 'application/octet-stream');
      res.setHeader('Cache-Control', 'no-store');
      res.end(content);
    } catch { res.writeHead(404).end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  try {
    browser = await chromium.launch({ headless: true, ...(process.argv[3] ? { executablePath: process.argv[3] } : {}) });
    for (const basePath of ['/', '/cubeflow/']) {
      const context = await browser.newContext();
      const errors = [];
      const external = [];
      context.on('page', page => page.on('pageerror', error => errors.push(error.message)));
      context.on('request', request => { if (!request.url().startsWith('http://127.0.0.1:')) external.push(request.url()); });
      const base = `http://127.0.0.1:${server.address().port}${basePath}`;
      let page = await context.newPage();
      await page.goto(base);
      await page.waitForFunction(() => document.getElementById('offline-status').textContent === 'Available offline');
      await page.close();
      await context.setOffline(true);
      for (const entry of ['', 'index.html?offline-test=1', 'CUBE%20Timer.html']) {
        page = await context.newPage();
        const response = await page.goto(base + entry);
        assert(response.fromServiceWorker(), 'Offline document must come from service worker');
        await page.waitForFunction(() => document.getElementById('offline-status').textContent.includes('Ready to practice'));
        await page.evaluate(() => document.fonts.ready);
        assert(await page.evaluate(() => document.fonts.check('600 16px Inter') && document.fonts.check('600 16px "JetBrains Mono"')));
        assert.equal(await page.locator('#settings-modal').evaluate(el => getComputedStyle(el).display), 'none');
        assert((await page.locator('#scramble-text').innerText()).trim().length > 10);
        const before = Number(await page.locator('#solve-count-badge').innerText());
        await page.keyboard.down('Space');
        await page.waitForTimeout(450);
        await page.keyboard.up('Space');
        await page.waitForTimeout(150);
        await page.keyboard.press('Space');
        assert.equal(Number(await page.locator('#solve-count-badge').innerText()), before + 1);
        await page.reload();
        assert.equal(Number(await page.locator('#solve-count-badge').innerText()), before + 1);
        await page.close();
      }
      assert.deepEqual(errors, []);
      assert.deepEqual(external, []);
      console.log(`PASS ${basePath}: offline reopen, both entries, query strings, fonts, styles, timer, saved solves, no external requests`);
      await context.close();
    }
  } finally {
    if (browser) await browser.close();
    server.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });
