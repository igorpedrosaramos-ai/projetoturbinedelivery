const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));
const fs = require('fs');

async function applyOption1() {
  const heroPath = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg.jpg');
  const masterBase = 'C:/Users/iprtr/.gemini/antigravity/brain/73a6409c-2e69-4e06-81c3-cedabd938118/.user_uploaded/media_1790808574659.jpg';
  
  const emblemPath = path.join(__dirname, 'assets', 'images', 'turbine-emblem.png');
  const textPath = path.join(__dirname, 'assets', 'images', 'turbine-text-white.png');

  // TV box in 2528x1686 hero
  const tvX = 1850;
  const tvY = 220;
  const tvW = 670;
  const tvH = 480;

  // 1. Get clean base TV frame from master
  const cleanFrame = await sharp(masterBase)
    .resize(2528, 1686, { kernel: 'lanczos3' })
    .extract({ left: tvX, top: tvY, width: tvW, height: tvH })
    .png()
    .toBuffer();

  // 2. Prepare Option 1: Max Scale Stacked Logo
  const emblemBuf = await sharp(emblemPath).png().toBuffer();
  const textBuf = await sharp(textPath).png().toBuffer();

  // 50% larger emblem: height = 188px, width = 352px
  const vEmblemH = 188;
  const vEmblemW = Math.round(vEmblemH * (808 / 432));
  const vEmblem = await sharp(emblemBuf).resize(vEmblemW, vEmblemH).png().toBuffer();

  // 50% larger text: height = 72px, width = 302px
  const vTextH = 72;
  const vTextW = Math.round(vTextH * (730 / 174));
  const vText = await sharp(textBuf).resize(vTextW, vTextH).png().toBuffer();

  // Canvas dimensions
  const vCanvasW = 500;
  const vCanvasH = 290;

  const vEmblemX = Math.round((vCanvasW - vEmblemW) / 2);
  const vEmblemY = 8;
  const vTextX = Math.round((vCanvasW - vTextW) / 2);
  const vTextY = 208;

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

  // Perspective 3D angle
  const angleDeg = -3.2;
  const skewYDeg = -1.8;
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
    .blur(1.4) // depth of field optical blur
    .toBuffer();

  const glowV = await sharp(warpedVLogo)
    .blur(9)
    .linear(0.42, 0)
    .toBuffer();

  // Center inside TV active screen area (tvW: 670, tvH: 480)
  // Left: ~105, Top: ~90
  const tvWithLogo = await sharp(cleanFrame)
    .composite([
      { input: glowV, left: 105, top: 92, blend: 'screen' },
      { input: warpedVLogo, left: 105, top: 92, opacity: 0.85 }
    ])
    .png()
    .toBuffer();

  await sharp(tvWithLogo).toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_option1_max_preview.png');

  // 3. Composite into hero-murillo-bg.jpg
  const currentHeroBuf = fs.readFileSync(heroPath);
  const finalHero = await sharp(currentHeroBuf)
    .composite([
      { input: tvWithLogo, left: tvX, top: tvY }
    ])
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const tempOut = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg-opt1.jpg');
  fs.writeFileSync(tempOut, finalHero);
  fs.renameSync(tempOut, heroPath);
  console.log('Option 1 applied to hero-murillo-bg.jpg successfully!');
}

applyOption1().catch(console.error);
