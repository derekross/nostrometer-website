// Renders the raster brand assets once: apple-touch-icon.png (180), icon-512.png
// and og.png (1200×630). Run: node tools/og/render.mjs
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import puppeteer from 'puppeteer';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const fontCss = `file://${root}/node_modules/@fontsource-variable/archivo/standard.css`;
const monoCss = `file://${root}/node_modules/@fontsource-variable/jetbrains-mono/index.css`;

const MARK = (size, ink, violet) => `
<svg viewBox="0 0 32 32" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <path d="M 7.515 24.485 A 12 12 0 1 1 24.485 24.485" fill="none" stroke="${ink}" stroke-width="3" stroke-linecap="round"/>
  <g stroke="${ink}" stroke-width="1.5" stroke-linecap="round">
    <line x1="10.343" y1="21.657" x2="8.575" y2="23.425"/>
    <line x1="8.609" y1="12.939" x2="6.299" y2="11.982"/>
    <line x1="16" y1="8" x2="16" y2="5.5"/>
    <line x1="23.391" y1="12.939" x2="25.701" y2="11.982"/>
    <line x1="21.657" y1="21.657" x2="23.425" y2="23.425"/>
  </g>
  <line x1="16" y1="16" x2="24.315" y2="12.556" stroke="${violet}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="16" cy="16" r="2.5" fill="${ink}"/>
</svg>`;

const INK = '#1a1a1f';
const PAPER = '#faf9f7';
const VIOLET = '#6a3fb8';
const BORDER = '#d9d4cc';
const MUTED = '#5c5c66';

/**
 * Wrap a PNG in an ICO container. The ICO format has embedded PNG frames since
 * Vista, so no re-encoding is needed — just the 6-byte header and one 16-byte
 * directory entry.
 */
function pngToIco(png, size) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(1, 4); // one image
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // width (0 means 256)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // height
  entry.writeUInt8(0, 2); // palette
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // colour planes
  entry.writeUInt16LE(32, 6); // bits per pixel
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(header.length + entry.length, 12);
  return Buffer.concat([header, entry, png]);
}

/**
 * `maskable` fills the whole square and keeps the mark inside the central 80%,
 * because Android crops an adaptive icon to whatever shape the launcher uses.
 */
function iconHtml(size, { maskable = false } = {}) {
  const pad = Math.round(size * (maskable ? 0.26 : 0.14));
  return `<!doctype html><html><head><style>
    html,body{margin:0}
    body{width:${size}px;height:${size}px;background:${PAPER};display:flex;align-items:center;justify-content:center}
  </style></head><body>${MARK(size - pad * 2, INK, VIOLET)}</body></html>`;
}

function ogHtml() {
  const ticks = `repeating-linear-gradient(to right, ${BORDER} 0 2px, transparent 2px 24px), repeating-linear-gradient(to right, ${BORDER} 0 2px, transparent 2px 120px)`;
  const chip = (t, ink) =>
    `<span style="display:inline-flex;align-items:center;justify-content:center;width:64px;height:48px;border-radius:8px;border:2px solid ${ink}66;background:${ink}24;color:${ink};font-family:'JetBrains Mono Variable';font-weight:600;font-size:28px">${t}</span>`;
  return `<!doctype html><html><head>
  <link rel="stylesheet" href="${fontCss}"><link rel="stylesheet" href="${monoCss}">
  <style>
    html,body{margin:0}
    body{width:1200px;height:630px;background:${PAPER};color:${INK};font-family:'Archivo Variable',sans-serif;position:relative;overflow:hidden}
    .wrap{position:absolute;inset:0;padding:72px 80px;display:flex;flex-direction:column;justify-content:space-between}
    .brand{display:flex;align-items:center;gap:20px;font-weight:700;font-size:36px;letter-spacing:-0.02em;font-stretch:110%}
    h1{margin:0;font-size:84px;line-height:88px;font-weight:700;letter-spacing:-0.03em;font-stretch:110%;max-width:18ch}
    h1 u{text-decoration-color:${VIOLET};text-decoration-thickness:7px;text-underline-offset:12px}
    .sub{font-family:'JetBrains Mono Variable',monospace;font-size:22px;letter-spacing:0.12em;text-transform:uppercase;color:${MUTED};margin-top:28px}
    .ruler{height:24px;background-image:${ticks};background-size:100% 12px,100% 24px;background-position:left bottom,left bottom;background-repeat:repeat-x}
    .chips{display:flex;gap:14px;align-items:center}
  </style></head><body>
  <div class="wrap">
    <div class="brand">${MARK(56, INK, VIOLET)} Nostrometer</div>
    <div>
      <h1>Every Nostr app, <u>measured</u> against the spec.</h1>
      <div class="sub">Discovered · Ranked · Rated NIP-by-NIP</div>
    </div>
    <div style="display:flex;flex-direction:column;gap:24px">
      <div class="chips">${chip('F', '#1f7a3f')}${chip('I', '#9a6b02')}${chip('S', '#b34a05')}${chip('B', '#c02020')}<span style="font-family:'JetBrains Mono Variable';font-size:20px;color:${MUTED};margin-left:12px">nostrometer.com</span></div>
      <div class="ruler"></div>
    </div>
  </div></body></html>`;
}

const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
try {
  const page = await browser.newPage();
  const shots = [
    ['public/apple-touch-icon.png', 180, 180, iconHtml(180)],
    ['public/icon-192.png', 192, 192, iconHtml(192)],
    ['public/icon-512.png', 512, 512, iconHtml(512)],
    ['public/icon-maskable-512.png', 512, 512, iconHtml(512, { maskable: true })],
    ['public/og.png', 1200, 630, ogHtml()],
  ];
  for (const [file, w, h, html] of shots) {
    await page.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
    await page.setContent(html, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.screenshot({ path: path.join(root, file), clip: { x: 0, y: 0, width: w, height: h } });
    console.log('wrote', file);
  }

  // Legacy fallback for anything that will not take the SVG.
  await page.setViewport({ width: 32, height: 32, deviceScaleFactor: 1 });
  await page.setContent(iconHtml(32), { waitUntil: 'load' });
  const png32 = await page.screenshot({ clip: { x: 0, y: 0, width: 32, height: 32 } });
  const { writeFileSync } = await import('node:fs');
  writeFileSync(path.join(root, 'public/favicon.ico'), pngToIco(Buffer.from(png32), 32));
  console.log('wrote public/favicon.ico');
} finally {
  await browser.close();
}
