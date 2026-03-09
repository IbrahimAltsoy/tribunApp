/**
 * Icon generator — tüm uygulama ikonlarını icon-source.svg'den üretir.
 * Kullanım: node scripts/generate-icon.js
 *
 * Üretilen dosyalar:
 *   assets/icon.png                — 1024×1024  (iOS + genel)
 *   assets/adaptive-icon.png       — 1024×1024  (Android adaptive foreground)
 *   assets/google-play-icon-512.png — 512×512   (Google Play Store)
 *   assets/splash-icon.png         — 1024×1024  (Splash screen)
 *   assets/favicon.png             — 48×48      (Web)
 */

const { execSync } = require("child_process");
const fs   = require("fs");
const path = require("path");

// ── sharp kontrolü ──────────────────────────────────────────────────────────
try { require.resolve("sharp"); }
catch {
  console.log("sharp yükleniyor...");
  execSync("npm install --no-save sharp", { stdio: "inherit", cwd: path.resolve(__dirname, "..") });
}
const sharp = require("sharp");

const ASSETS = path.resolve(__dirname, "../assets");

// ── SVG şablonu ─────────────────────────────────────────────────────────────
// padding: iç içe dairelerin kenara olan boşluğu (adaptive için daha fazla)
function buildSvg(size, padding) {
  const cx   = size / 2;
  const cy   = size * 0.42;           // dikey merkez biraz yukarıda
  const base = (size / 2) - padding;  // en dıştaki dairenin yarıçapı

  const r1 = base;                    // koyu bordo dış halka
  const r2 = base * 0.83;            // koyu kırmızı
  const r3 = base * 0.65;            // orta kırmızı
  const r4 = base * 0.48;            // parlak kırmızı (iç)

  // oval boyutları
  const ow  = base * 0.215;
  const oh  = base * 0.285;
  const ocy = cy - base * 0.04;

  // yazı boyutları
  const gsSize  = size * 0.145;
  const trSize  = size * 0.104;
  const gsY     = size * 0.726;
  const trY     = size * 0.868;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <circle cx="${cx}" cy="${cy}" r="${r1}" fill="#3B0000"/>
  <circle cx="${cx}" cy="${cy}" r="${r2}" fill="#6E0000"/>
  <circle cx="${cx}" cy="${cy}" r="${r3}" fill="#B30000"/>
  <circle cx="${cx}" cy="${cy}" r="${r4}" fill="#CC1010"/>
  <ellipse cx="${cx}" cy="${ocy}" rx="${ow}" ry="${oh}" fill="#FF8C00"/>
  <ellipse cx="${cx - ow * 0.1}" cy="${ocy - oh * 0.18}" rx="${ow * 0.48}" ry="${oh * 0.52}" fill="#FFD000"/>
  <text x="${cx}" y="${gsY}" text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-size="${gsSize}" font-weight="900" fill="#FFC72C" letter-spacing="-1">GS</text>
  <text x="${cx}" y="${trY}" text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-size="${trSize}" font-weight="900" fill="#FFFFFF" letter-spacing="${size * 0.01}">TRIBUN</text>
</svg>`;
}

// ── Favicon (sadece daireler, GS yazısı — sade) ─────────────────────────────
function buildFaviconSvg(size) {
  const cx = size / 2;
  const cy = size * 0.42;
  const base = (size / 2) * 0.92;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" fill="#000000"/>
  <circle cx="${cx}" cy="${cy}" r="${base}" fill="#3B0000"/>
  <circle cx="${cx}" cy="${cy}" r="${base * 0.83}" fill="#6E0000"/>
  <circle cx="${cx}" cy="${cy}" r="${base * 0.65}" fill="#B30000"/>
  <circle cx="${cx}" cy="${cy}" r="${base * 0.48}" fill="#CC1010"/>
  <ellipse cx="${cx}" cy="${cy - base * 0.04}" rx="${base * 0.215}" ry="${base * 0.285}" fill="#FF8C00"/>
  <ellipse cx="${cx - base * 0.02}" cy="${cy - base * 0.22}" rx="${base * 0.1}" ry="${base * 0.15}" fill="#FFD000"/>
  <text x="${cx}" y="${size * 0.82}" text-anchor="middle"
        font-family="Arial Black, Arial, sans-serif"
        font-size="${size * 0.28}" font-weight="900" fill="#FFC72C">GS</text>
</svg>`;
}

// ── Üretim ───────────────────────────────────────────────────────────────────
async function generate() {
  const jobs = [
    { out: path.join(ASSETS, "icon.png"),                            svg: buildSvg(1024, 28),  size: 1024 },
    { out: path.join(ASSETS, "adaptive-icon.png"),                   svg: buildSvg(1024, 110), size: 1024 },
    { out: path.join(ASSETS, "google-play-icon-512.png"),            svg: buildSvg(512, 14),   size: 512  },
    { out: path.join(ASSETS, "splash-icon.png"),                     svg: buildSvg(1024, 28),  size: 1024 },
    { out: path.join(ASSETS, "favicon.png"),                         svg: buildFaviconSvg(48), size: 48   },
    { out: path.resolve(__dirname, "../src/assets/logos/logo.png"),  svg: buildSvg(512, 14),   size: 512  },
  ];

  for (const job of jobs) {
    await sharp(Buffer.from(job.svg))
      .resize(job.size, job.size)
      .png()
      .toFile(job.out);
    console.log(`✓ ${path.relative(path.resolve(__dirname, ".."), job.out)} (${job.size}×${job.size})`);
  }

  console.log("\nTüm ikonlar güncellendi.");
}

generate().catch((err) => { console.error(err); process.exit(1); });
