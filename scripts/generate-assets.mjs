import sharp from 'sharp'
import { readFileSync, writeFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const publicDir = join(__dirname, '..', 'public')

// Read the SVG favicon
const faviconSvg = readFileSync(join(publicDir, 'favicon.svg'))

// Generate PNG favicons at different sizes
const sizes = [
  { name: 'favicon-16x16.png', size: 16 },
  { name: 'favicon-32x32.png', size: 32 },
  { name: 'favicon-192x192.png', size: 192 },
  { name: 'favicon-512x512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
]

console.log('Generating favicon PNGs...')

for (const { name, size } of sizes) {
  await sharp(faviconSvg)
    .resize(size, size)
    .png()
    .toFile(join(publicDir, name))
  console.log(`  ✓ ${name}`)
}

// Generate OG image from SVG
console.log('Generating OG image...')
const ogSvg = readFileSync(join(publicDir, 'og-image.svg'))

await sharp(ogSvg)
  .resize(1200, 630)
  .png()
  .toFile(join(publicDir, 'og-image.png'))
console.log('  ✓ og-image.png')

console.log('\nAll assets generated successfully!')

