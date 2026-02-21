import sharp from 'sharp';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const assetsDir = resolve(__dirname, '..', 'assets');
const svgBuffer = readFileSync(resolve(assetsDir, 'circle-picks.svg'));

// Create a white version of the SVG for use on colored backgrounds
const svgString = svgBuffer.toString();
const whiteSvgBuffer = Buffer.from(
  svgString
    .replace(/<linearGradient[\s\S]*?<\/linearGradient>/, '')
    .replace(/fill="url\(#paint0_linear_8_1012\)"/, 'fill="white"')
);

// 1. Splash icon: 512x512, owl centered on transparent background
async function generateSplashIcon() {
  const resized = await sharp(svgBuffer)
    .resize(400, 452, { fit: 'inside' }) // Scale owl to fit within padding
    .toBuffer();

  await sharp({
    create: { width: 512, height: 512, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(resolve(assetsDir, 'splash-icon.png'));

  console.log('Generated splash-icon.png (512x512)');
}

// 2. App icon: 1024x1024, white owl centered on orange background with padding
async function generateAppIcon() {
  const resized = await sharp(whiteSvgBuffer)
    .resize(680, 768, { fit: 'inside' }) // Owl with generous padding
    .toBuffer();

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 253, g: 81, b: 46, alpha: 255 } },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(resolve(assetsDir, 'icon.png'));

  console.log('Generated icon.png (1024x1024)');
}

// 3. Adaptive icon: 1024x1024, owl centered on transparent bg with extra padding for Android safe zone
async function generateAdaptiveIcon() {
  const resized = await sharp(svgBuffer)
    .resize(540, 610, { fit: 'inside' }) // Extra padding for Android circle/squircle crop
    .toBuffer();

  await sharp({
    create: { width: 1024, height: 1024, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } },
  })
    .composite([{ input: resized, gravity: 'centre' }])
    .png()
    .toFile(resolve(assetsDir, 'adaptive-icon.png'));

  console.log('Generated adaptive-icon.png (1024x1024)');
}

await Promise.all([generateSplashIcon(), generateAppIcon(), generateAdaptiveIcon()]);
console.log('All icons generated!');
