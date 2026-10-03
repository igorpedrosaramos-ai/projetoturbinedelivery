const sharp = require('sharp');
const path = require('path');

async function composite() {
  const baseImg = await sharp('C:/Users/iprtr/.gemini/antigravity/brain/73a6409c-2e69-4e06-81c3-cedabd938118/.user_uploaded/media_1790808574659.jpg').toBuffer();
  
  // 1. Mug patch: extract from media_1790798173904.jpg
  // Mug logo is at x: 838..890, y: 449..487
  // Mug region: x: 800, y: 420, width: 110, height: 100
  const mugCropW = 110, mugCropH = 100;
  const mugCropX = 800, mugCropY = 420;
  
  // Create an elliptical feather mask for mug
  const mugMaskSvg = Buffer.from(`
    <svg width="${mugCropW}" height="${mugCropH}">
      <defs>
        <radialGradient id="grad" cx="50%" cy="50%" r="50%">
          <stop offset="60%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </radialGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad)" />
    </svg>
  `);
  
  const cleanMugPatch = await sharp('C:/Users/iprtr/.gemini/antigravity/brain/73a6409c-2e69-4e06-81c3-cedabd938118/.user_uploaded/media_1790798173904.jpg')
    .extract({ left: mugCropX, top: mugCropY, width: mugCropW, height: mugCropH })
    .composite([{ input: mugMaskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  // 2. TV Screen patch from assets/images/hero-murillo-bg.jpg
  // TV Screen: x: 765..1024, y: 145..280
  const tvCropX = 765, tvCropY = 145, tvCropW = 1024 - tvCropX, tvCropH = 135;
  
  // Mask for TV screen: soft rectangle inside the bezel
  const tvMaskSvg = Buffer.from(`
    <svg width="${tvCropW}" height="${tvCropH}">
      <defs>
        <linearGradient id="hFade" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="6%" stop-color="white" stop-opacity="1" />
          <stop offset="96%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="1" />
        </linearGradient>
        <linearGradient id="vFade" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="white" stop-opacity="0" />
          <stop offset="8%" stop-color="white" stop-opacity="1" />
          <stop offset="92%" stop-color="white" stop-opacity="1" />
          <stop offset="100%" stop-color="white" stop-opacity="0" />
        </linearGradient>
        <mask id="hMask">
          <rect width="100%" height="100%" fill="url(#hFade)" />
        </mask>
      </defs>
      <rect width="100%" height="100%" fill="url(#vFade)" mask="url(#hMask)" />
    </svg>
  `);
  
  const tvPatch = await sharp('C:/Users/iprtr/.gemini/antigravity/scratch/turbine-delivery-lp/assets/images/hero-murillo-bg.jpg')
    .extract({ left: tvCropX, top: tvCropY, width: tvCropW, height: tvCropH })
    .composite([{ input: tvMaskSvg, blend: 'dest-in' }])
    .png()
    .toBuffer();

  await sharp(baseImg)
    .composite([
      { input: cleanMugPatch, left: mugCropX, top: mugCropY },
      { input: tvPatch, left: tvCropX, top: tvCropY }
    ])
    .jpeg({ quality: 96 })
    .toFile('test_composite.jpg');

  console.log('Composite finished successfully');
}

composite().catch(console.error);
