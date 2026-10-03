const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));
const fs = require('fs');

async function applyRealisticTv() {
  const heroPath = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg.jpg');
  const masterBase = 'C:/Users/iprtr/.gemini/antigravity/brain/73a6409c-2e69-4e06-81c3-cedabd938118/.user_uploaded/media_1790808574659.jpg';
  
  const emblemPath = path.join(__dirname, 'assets', 'images', 'turbine-emblem.png');
  const textPath = path.join(__dirname, 'assets', 'images', 'turbine-text-white.png');

  // TV box in 2528x1686 hero
  const tvX = 1850;
  const tvY = 220;
  const tvW = 670;
  const tvH = 480;

  // 1. Get clean base TV frame from master (with natural glass reflections)
  const cleanFrame = await sharp(masterBase)
    .resize(2528, 1686, { kernel: 'lanczos3' })
    .extract({ left: tvX, top: tvY, width: tvW, height: tvH })
    .png()
    .toBuffer();

  // 2. Prepare Emblem with color grading:
  // Convert harsh cyan into a sophisticated sapphire corporate blue, reduce harshness
  const emblemRaw = await sharp(emblemPath).raw().toBuffer({ resolveWithObject: true });
  const gradedEmblemBuf = Buffer.alloc(emblemRaw.info.width * emblemRaw.info.height * 4);
  
  for (let i = 0; i < emblemRaw.info.width * emblemRaw.info.height; i++) {
    let r = emblemRaw.data[i * 4];
    let g = emblemRaw.data[i * 4 + 1];
    let b = emblemRaw.data[i * 4 + 2];
    const a = emblemRaw.data[i * 4 + 3];

    if (a > 10) {
      // Warm up the blues slightly: mix a bit of room warmth (R + 15), slightly reduce green/cyan
      // Tone down pure electric cyan: scale down maximum saturation
      r = Math.min(255, Math.round(r * 0.95 + 10));
      g = Math.min(255, Math.round(g * 0.85 + 5));
      b = Math.min(255, Math.round(b * 0.85 + 15));
      
      // Reduce luminance ceiling to ~80%
      r = Math.round(r * 0.82);
      g = Math.round(g * 0.82);
      b = Math.round(b * 0.82);
    }

    gradedEmblemBuf[i * 4] = r;
    gradedEmblemBuf[i * 4 + 1] = g;
    gradedEmblemBuf[i * 4 + 2] = b;
    gradedEmblemBuf[i * 4 + 3] = a;
  }

  const gradedEmblem = await sharp(gradedEmblemBuf, {
    raw: { width: emblemRaw.info.width, height: emblemRaw.info.height, channels: 4 }
  }).png().toBuffer();

  // 3. Prepare Text with soft silver/ivory color (#E2DFD9) and ~75% max luminance
  const textRaw = await sharp(textPath).raw().toBuffer({ resolveWithObject: true });
  const gradedTextBuf = Buffer.alloc(textRaw.info.width * textRaw.info.height * 4);
  
  for (let i = 0; i < textRaw.info.width * textRaw.info.height; i++) {
    const a = textRaw.data[i * 4 + 3];
    if (a > 10) {
      // Soft satin ivory/silver: R: 182, G: 180, B: 175 (scaled by original alpha)
      const factor = a / 255;
      gradedTextBuf[i * 4] = Math.round(182 * factor);
      gradedTextBuf[i * 4 + 1] = Math.round(180 * factor);
      gradedTextBuf[i * 4 + 2] = Math.round(175 * factor);
      gradedTextBuf[i * 4 + 3] = a;
    }
  }

  const gradedText = await sharp(gradedTextBuf, {
    raw: { width: textRaw.info.width, height: textRaw.info.height, channels: 4 }
  }).png().toBuffer();

  // 4. Resize and assemble into Stacked Logo
  const vEmblemH = 185;
  const vEmblemW = Math.round(vEmblemH * (808 / 432)); // ~346px
  const scaledEmblem = await sharp(gradedEmblem).resize(vEmblemW, vEmblemH).png().toBuffer();

  const vTextH = 70;
  const vTextW = Math.round(vTextH * (730 / 174)); // ~294px
  const scaledText = await sharp(gradedText).resize(vTextW, vTextH).png().toBuffer();

  const vCanvasW = 500;
  const vCanvasH = 290;
  const vEmblemX = Math.round((vCanvasW - vEmblemW) / 2);
  const vEmblemY = 8;
  const vTextX = Math.round((vCanvasW - vTextW) / 2);
  const vTextY = 206;

  const flatVLogo = await sharp({
    create: {
      width: vCanvasW,
      height: vCanvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: scaledEmblem, left: vEmblemX, top: vEmblemY },
      { input: scaledText, left: vTextX, top: vTextY }
    ])
    .png()
    .toBuffer();

  // 5. Add ambient amber light reflection on the bottom of the logo
  // (Simulates the amber LED strip right below the TV)
  const amberGradientSvg = Buffer.from(`
    <svg width="${vCanvasW}" height="${vCanvasH}">
      <defs>
        <linearGradient id="amberGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#FFD180" stop-opacity="0" />
          <stop offset="65%" stop-color="#FFD180" stop-opacity="0" />
          <stop offset="100%" stop-color="#FFB347" stop-opacity="0.22" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#amberGrad)" />
    </svg>
  `);

  const logoWithAmber = await sharp(flatVLogo)
    .composite([
      { input: amberGradientSvg, blend: 'colour-dodge' }
    ])
    .png()
    .toBuffer();

  // 6. Perspective 3D Transformation
  const angleDeg = -3.2;
  const skewYDeg = -1.8;
  const vBase64 = logoWithAmber.toString('base64');
  const vWarpSvg = Buffer.from(`
    <svg width="${vCanvasW + 40}" height="${vCanvasH + 40}" viewBox="0 0 ${vCanvasW + 40} ${vCanvasH + 40}">
      <g transform="translate(20, 20) rotate(${angleDeg}, ${vCanvasW/2}, ${vCanvasH/2}) skewY(${skewYDeg})">
        <image href="data:image/png;base64,${vBase64}" width="${vCanvasW}" height="${vCanvasH}" />
      </g>
    </svg>
  `);

  // 7. Calibrate Optical Lens Defocus (depth of field matching the bookshelf at 2.4px)
  const warpedLogo = await sharp(vWarpSvg)
    .png()
    .blur(2.4)
    .toBuffer();

  // 8. Add subtle camera sensor grain (ISO noise matching)
  const warpedRaw = await sharp(warpedLogo).raw().toBuffer({ resolveWithObject: true });
  for (let i = 0; i < warpedRaw.info.width * warpedRaw.info.height; i++) {
    const a = warpedRaw.data[i * 4 + 3];
    if (a > 10) {
      // pseudo-random gaussian-like grain
      const noise = ((Math.random() + Math.random() + Math.random() - 1.5) / 1.5) * 8;
      warpedRaw.data[i * 4] = Math.max(0, Math.min(255, warpedRaw.data[i * 4] + noise));
      warpedRaw.data[i * 4 + 1] = Math.max(0, Math.min(255, warpedRaw.data[i * 4 + 1] + noise));
      warpedRaw.data[i * 4 + 2] = Math.max(0, Math.min(255, warpedRaw.data[i * 4 + 2] + noise));
    }
  }

  const grainyWarpedLogo = await sharp(warpedRaw.data, {
    raw: { width: warpedRaw.info.width, height: warpedRaw.info.height, channels: 4 }
  }).png().toBuffer();

  // 9. Soft light bloom/glow (emissive display halation)
  const bloomGlow = await sharp(grainyWarpedLogo)
    .blur(11)
    .linear(0.35, 0)
    .toBuffer();

  // 10. Composite onto clean TV with Screen blend mode & glass reflection preservation
  const tvWithLogo = await sharp(cleanFrame)
    .composite([
      { input: bloomGlow, left: 105, top: 92, blend: 'screen' },
      { input: grainyWarpedLogo, left: 105, top: 92, blend: 'screen', opacity: 0.88 }
    ])
    .png()
    .toBuffer();

  await sharp(tvWithLogo).toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_realistic_preview.png');
  console.log('Saved tv_realistic_preview.png');

  // 11. Composite into hero-murillo-bg.jpg safely
  const currentHeroBuf = fs.readFileSync(heroPath);
  const finalHero = await sharp(currentHeroBuf)
    .composite([
      { input: tvWithLogo, left: tvX, top: tvY }
    ])
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const tempOut = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg-realistic.jpg');
  fs.writeFileSync(tempOut, finalHero);
  fs.renameSync(tempOut, heroPath);
  console.log('Updated hero-murillo-bg.jpg with 100% photorealistic TV logo!');
}

applyRealisticTv().catch(console.error);
