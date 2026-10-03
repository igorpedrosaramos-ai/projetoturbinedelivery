const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));
const fs = require('fs');

async function testTvOptions() {
  const emblemPath = path.join(__dirname, 'assets', 'images', 'turbine-emblem.png');
  const textPath = path.join(__dirname, 'assets', 'images', 'turbine-text-white.png');
  const tvFramePath = 'C:/Users/iprtr/.gemini/antigravity/scratch/tv_full_frame.png';

  // 1. Prepare Emblem and Text
  // Load high-res transparent emblem
  const emblemBuf = await sharp(emblemPath).png().toBuffer();
  const textBuf = await sharp(textPath).png().toBuffer();

  // Helper to add realistic grain/noise matching the background ISO
  function addNoise(rawBuffer, width, height, amount = 12) {
    for (let i = 0; i < width * height; i++) {
      if (rawBuffer[i * 4 + 3] > 10) { // only on visible pixels
        const noise = (Math.random() - 0.5) * amount;
        rawBuffer[i * 4] = Math.max(0, Math.min(255, rawBuffer[i * 4] + noise));
        rawBuffer[i * 4 + 1] = Math.max(0, Math.min(255, rawBuffer[i * 4 + 1] + noise));
        rawBuffer[i * 4 + 2] = Math.max(0, Math.min(255, rawBuffer[i * 4 + 2] + noise));
      }
    }
    return rawBuffer;
  }

  // Perspective angle parameters derived from TV frame:
  // Slope is approx -3.5 degrees (tan(-3.5 deg) ~= -0.061)
  const angleDeg = -3.2;
  const skewYDeg = -1.8;

  // ==========================================
  // OPTION 1: HORIZONTAL LOCKUP (Emblem Left, Text Right)
  // Balanced spacing, no arrow collision, proper scaling
  // ==========================================
  const hEmblemH = 110;
  const hEmblemW = Math.round(hEmblemH * (808 / 432)); // ~206px
  const hEmblem = await sharp(emblemBuf).resize(hEmblemW, hEmblemH).png().toBuffer();

  const hTextH = 58;
  const hTextW = Math.round(hTextH * (730 / 174)); // ~243px
  const hText = await sharp(textBuf).resize(hTextW, hTextH).png().toBuffer();

  // Total horizontal lockup canvas
  const hCanvasW = 500;
  const hCanvasH = 160;

  // Position emblem on left, text to the right with breathing room
  const hEmblemX = 20;
  const hEmblemY = Math.round((hCanvasH - hEmblemH) / 2);
  const hTextX = 220;
  const hTextY = Math.round((hCanvasH - hTextH) / 2);

  const flatHLogo = await sharp({
    create: {
      width: hCanvasW,
      height: hCanvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: hEmblem, left: hEmblemX, top: hEmblemY },
      { input: hText, left: hTextX, top: hTextY }
    ])
    .png()
    .toBuffer();

  // Apply 3D perspective angle via SVG transform
  const hBase64 = flatHLogo.toString('base64');
  const hWarpSvg = Buffer.from(`
    <svg width="${hCanvasW + 40}" height="${hCanvasH + 40}" viewBox="0 0 ${hCanvasW + 40} ${hCanvasH + 40}">
      <g transform="translate(20, 25) rotate(${angleDeg}, ${hCanvasW/2}, ${hCanvasH/2}) skewY(${skewYDeg})">
        <image href="data:image/png;base64,${hBase64}" width="${hCanvasW}" height="${hCanvasH}" />
      </g>
    </svg>
  `);

  const warpedHLogo = await sharp(hWarpSvg)
    .png()
    .blur(1.4) // photographic depth of field
    .toBuffer();

  // Make screen glow version
  const glowH = await sharp(warpedHLogo)
    .blur(6)
    .linear(0.4, 0)
    .toBuffer();

  // Composite Option 1 onto tv_full_frame
  const tvOpt1 = await sharp(tvFramePath)
    .composite([
      // soft screen backlight/glow
      { input: glowH, left: 100, top: 165, blend: 'screen' },
      // crisp logo with 85% opacity
      { input: warpedHLogo, left: 100, top: 165, opacity: 0.85 }
    ])
    .png()
    .toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_option1_horizontal.png');
  console.log('Saved tv_option1_horizontal.png');

  // ==========================================
  // OPTION 2: STACKED LOCKUP (Official Emblem Top, Text Below)
  // Perfectly centered on the 16:9 screen
  // ==========================================
  const vEmblemH = 135;
  const vEmblemW = Math.round(vEmblemH * (808 / 432)); // ~252px
  const vEmblem = await sharp(emblemBuf).resize(vEmblemW, vEmblemH).png().toBuffer();

  const vTextH = 52;
  const vTextW = Math.round(vTextH * (730 / 174)); // ~218px
  const vText = await sharp(textBuf).resize(vTextW, vTextH).png().toBuffer();

  const vCanvasW = 380;
  const vCanvasH = 220;

  const vEmblemX = Math.round((vCanvasW - vEmblemW) / 2);
  const vEmblemY = 12;
  const vTextX = Math.round((vCanvasW - vTextW) / 2);
  const vTextY = 152;

  const flatVLogo = await sharp({
    create: {
      width: vCanvasW,
      height: vCanvasH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: vEmblem, left: vEmblemX, top: vEmblemY },
      { input: vText, left: vTextX, top: vTextY }
    ])
    .png()
    .toBuffer();

  const vBase64 = flatVLogo.toString('base64');
  const vWarpSvg = Buffer.from(`
    <svg width="${vCanvasW + 40}" height="${vCanvasH + 40}" viewBox="0 0 ${vCanvasW + 40} ${vCanvasH + 40}">
      <g transform="translate(20, 20) rotate(${angleDeg}, ${vCanvasW/2}, ${vCanvasH/2}) skewY(${skewYDeg})">
        <image href="data:image/png;base64,${vBase64}" width="${vCanvasW}" height="${vCanvasH}" />
      </g>
    </svg>
  `);

  const warpedVLogo = await sharp(vWarpSvg)
    .png()
    .blur(1.4)
    .toBuffer();

  const glowV = await sharp(warpedVLogo)
    .blur(7)
    .linear(0.4, 0)
    .toBuffer();

  const tvOpt2 = await sharp(tvFramePath)
    .composite([
      { input: glowV, left: 165, top: 135, blend: 'screen' },
      { input: warpedVLogo, left: 165, top: 135, opacity: 0.85 }
    ])
    .png()
    .toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_option2_stacked.png');
  console.log('Saved tv_option2_stacked.png');

  // ==========================================
  // OPTION 3: ORIGINAL TYPOGRAPHIC STYLE (Clean & Minimalist like original photoshoot)
  // ==========================================
  const mTextH = 75;
  const mTextW = Math.round(mTextH * (730 / 174)); // ~315px
  const mText = await sharp(textBuf).resize(mTextW, mTextH).png().toBuffer();

  const mCanvasW = 360;
  const mCanvasH = 120;
  const mBase64 = mText.toString('base64');
  const mWarpSvg = Buffer.from(`
    <svg width="${mCanvasW + 40}" height="${mCanvasH + 40}" viewBox="0 0 ${mCanvasW + 40} ${mCanvasH + 40}">
      <g transform="translate(20, 20) rotate(${angleDeg}, ${mCanvasW/2}, ${mCanvasH/2}) skewY(${skewYDeg})">
        <image href="data:image/png;base64,${mBase64}" width="${mTextW}" height="${mTextH}" />
      </g>
    </svg>
  `);

  const warpedMLogo = await sharp(mWarpSvg).png().blur(1.4).toBuffer();
  const glowM = await sharp(warpedMLogo).blur(6).linear(0.35, 0).toBuffer();

  await sharp(tvFramePath)
    .composite([
      { input: glowM, left: 175, top: 175, blend: 'screen' },
      { input: warpedMLogo, left: 175, top: 175, opacity: 0.75 }
    ])
    .png()
    .toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_option3_minimalist.png');
  console.log('Saved tv_option3_minimalist.png');
}

testTvOptions().catch(console.error);
