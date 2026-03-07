const sharp = require('sharp');
const path = require('path');

const assetsDir = path.join(__dirname, '..', 'assets');

async function createSquareIcon(width, height, outputPath) {
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="${width}" height="${height}" fill="#0A0A0A"/>
      <defs>
        <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C80F19"/>
          <stop offset="100%" stop-color="#8B0000"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFC72C"/>
          <stop offset="100%" stop-color="#FFD45A"/>
        </linearGradient>
      </defs>
      <!-- Circle badge -->
      <circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.28}" fill="url(#redGrad)" opacity="0.15"/>
      <circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.22}" fill="#1A1A1A"/>
      <circle cx="${width * 0.5}" cy="${height * 0.38}" r="${width * 0.20}" fill="url(#redGrad)"/>
      <!-- Flame path approximation -->
      <ellipse cx="${width * 0.5}" cy="${height * 0.34}" rx="${width * 0.08}" ry="${height * 0.12}" fill="#FF6B00" opacity="0.9"/>
      <ellipse cx="${width * 0.5}" cy="${height * 0.38}" rx="${width * 0.06}" ry="${height * 0.08}" fill="#FFCC00"/>
      <!-- GS text -->
      <text x="${width * 0.5}" y="${height * 0.68}"
            font-family="Arial Black, Arial, sans-serif"
            font-weight="900"
            font-size="${width * 0.20}"
            text-anchor="middle"
            fill="url(#goldGrad)">GS</text>
      <!-- Tribün text -->
      <text x="${width * 0.5}" y="${height * 0.82}"
            font-family="Arial Black, Arial, sans-serif"
            font-weight="900"
            font-size="${width * 0.09}"
            text-anchor="middle"
            fill="#FFFFFF"
            letter-spacing="3">TRIBUN</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Created: ${outputPath}`);
}

async function createFeatureBanner(outputPath) {
  const svg = `
    <svg width="1024" height="500" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#1A0000"/>
          <stop offset="50%" stop-color="#0A0A0A"/>
          <stop offset="100%" stop-color="#0A0A0A"/>
        </linearGradient>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#FFC72C"/>
          <stop offset="100%" stop-color="#FFD45A"/>
        </linearGradient>
        <linearGradient id="redGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#C80F19"/>
          <stop offset="100%" stop-color="#8B0000"/>
        </linearGradient>
      </defs>
      <!-- Background -->
      <rect width="1024" height="500" fill="url(#bgGrad)"/>
      <!-- Decorative circle -->
      <circle cx="512" cy="220" r="300" fill="#C80F19" opacity="0.05"/>
      <circle cx="512" cy="220" r="200" fill="#C80F19" opacity="0.05"/>
      <!-- Red accent line top -->
      <rect x="0" y="0" width="1024" height="4" fill="url(#redGrad)"/>
      <!-- Red accent line bottom -->
      <rect x="0" y="496" width="1024" height="4" fill="url(#redGrad)"/>
      <!-- GS -->
      <text x="512" y="230"
            font-family="Arial Black, Arial, sans-serif"
            font-weight="900"
            font-size="160"
            text-anchor="middle"
            fill="url(#goldGrad)">GS</text>
      <!-- Tribün -->
      <text x="512" y="330"
            font-family="Arial Black, Arial, sans-serif"
            font-weight="900"
            font-size="80"
            text-anchor="middle"
            fill="#FFFFFF"
            letter-spacing="8">TRIBUN</text>
      <!-- Tagline -->
      <text x="512" y="400"
            font-family="Arial, sans-serif"
            font-size="28"
            text-anchor="middle"
            fill="#888888"
            letter-spacing="2">Galatasaray Taraftar Uygulamasi</text>
    </svg>
  `;

  await sharp(Buffer.from(svg)).png().toFile(outputPath);
  console.log(`Created: ${outputPath}`);
}

async function main() {
  console.log('Generating assets...');

  // splash-icon.png
  await createSquareIcon(1024, 1024, path.join(assetsDir, 'splash-icon.png'));

  // google-play-icon-512.png
  await createSquareIcon(512, 512, path.join(assetsDir, 'google-play-icon-512.png'));

  // adaptive-icon.png (Android)
  await createSquareIcon(1024, 1024, path.join(assetsDir, 'adaptive-icon.png'));

  // google-play-feature banner
  await createFeatureBanner(path.join(assetsDir, 'google-play-feature-1024x500.png'));

  // src/assets/logos/logo.png
  await createSquareIcon(512, 512, path.join(__dirname, '..', 'src', 'assets', 'logos', 'logo.png'));

  console.log('Done! All assets generated.');
}

main().catch(console.error);
