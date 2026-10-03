const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));
const fs = require('fs');

async function makeFavicons() {
  const emblemPath = path.join(__dirname, 'assets', 'images', 'turbine-emblem.png');
  
  // Clean tight crop of emblem directly
  const tightEmblem = await sharp(emblemPath)
    .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // Save standalone emblem favicon
  await sharp(tightEmblem)
    .resize(32, 32)
    .png()
    .toFile(path.join(__dirname, 'assets', 'images', 'favicon-32x32.png'));

  await sharp(tightEmblem)
    .resize(192, 192)
    .png()
    .toFile(path.join(__dirname, 'assets', 'images', 'favicon-192x192.png'));

  await sharp(tightEmblem)
    .toFile(path.join(__dirname, 'assets', 'images', 'favicon.png'));

  console.log('Favicons generated successfully!');
}

makeFavicons().catch(console.error);
