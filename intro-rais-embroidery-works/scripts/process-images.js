const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const sourceDir = "c:/Users/musab/Downloads/new frames";
const destDir = path.resolve(__dirname, '..', 'public', 'sequence');

if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, { recursive: true });
}

const allFiles = fs.readdirSync(sourceDir)
  .filter(f => f.endsWith('.jpg'))
  .sort();

if (allFiles.length === 0) {
  console.error("No image files found in", sourceDir);
  process.exit(1);
}

// We want exactly 240 frames.
const step = allFiles.length / 240;
let selectedFiles = [];
for (let i = 0; i < 240; i++) {
  const index = Math.floor(i * step); // use Math.floor to ensure we stay in bounds safely
  if (index < allFiles.length) {
    selectedFiles.push(allFiles[index]);
  }
}

async function processImages() {
  console.log(`Starting processing of ${selectedFiles.length} frames...`);
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    const sourcePath = path.join(sourceDir, file);
    const destPath = path.join(destDir, `frame_${i}.webp`);

    // Extreme lag was caused by 1080p/90 quality resulting in 3.5MB WebPs (250MB total sequence memory threshold crash)
    // 720p at 70 quality is the web standard for performant sequences
    await sharp(sourcePath)
      .resize({ width: 1280 })
      .webp({ quality: 70 })
      .toFile(destPath);

    // Log progress occasionally
    if (i % 40 === 0) console.log(`Processed ${i}/240 frames...`);
  }
  console.log('All 240 frames processed successfully!');
}

processImages().catch(console.error);
