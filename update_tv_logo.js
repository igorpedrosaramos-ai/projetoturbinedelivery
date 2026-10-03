const path = require('path');
const sharp = require(path.join(__dirname, 'node_modules', 'sharp'));
const fs = require('fs');

async function updateTvLogo() {
  const emblemPath = path.join(__dirname, 'assets', 'images', 'turbine-emblem.png');
  const textPath = path.join(__dirname, 'assets', 'images', 'turbine-text-white.png');
  const heroPath = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg.jpg');

  // TV screen extraction coordinates in 2528x1686 hero
  const tvX = 1880;
  const tvY = 350;
  const tvW = 645;
  const tvH = 350;

  // 1. Get the base clean TV from the original master (which has no logo on the TV)
  const masterBase = 'C:/Users/iprtr/.gemini/antigravity/brain/73a6409c-2e69-4e06-81c3-cedabd938118/.user_uploaded/media_1790808574659.jpg';
  const cleanTV = await sharp(masterBase)
    .resize(2528, 1686, { kernel: 'lanczos3' })
    .extract({ left: tvX, top: tvY, width: tvW, height: tvH })
    .png()
    .toBuffer();

  // 2. Prepare emblem (808x432 original ratio ~1.87)
  const emblemH = 110;
  const emblemW = Math.round(emblemH * (808 / 432)); // ~206px
  const scaledEmblem = await sharp(emblemPath)
    .resize(emblemW, emblemH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 3. Prepare text ("TURBINE GESTÃO DE DELIVERY" 730x174 ratio ~4.2)
  const textH = 65;
  const textW = Math.round(textH * (730 / 174)); // ~272px
  const scaledText = await sharp(textPath)
    .resize(textW, textH, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  // 4. Combined Canvas: 460 x 140
  const lockupW = 460;
  const lockupH = 140;

  const emblemX = 0;
  const emblemY = Math.round((lockupH - emblemH) / 2);
  const textX = 180; // slight tasteful tuck next to turbine rotor
  const textY = Math.round((lockupH - textH) / 2);

  const logoLockup = await sharp({
    create: {
      width: lockupW,
      height: lockupH,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 }
    }
  })
    .composite([
      { input: scaledEmblem, left: emblemX, top: emblemY },
      { input: scaledText, left: textX, top: textY }
    ])
    .png()
    .toBuffer();

  // 5. Add realistic screen depth of field blur (~1.2px)
  const blurredLockup = await sharp(logoLockup)
    .blur(1.2)
    .png()
    .toBuffer();

  // 6. Composite the logo onto cleanTV (center inside TV active screen ~600x310)
  const tvCenterLeft = 90;
  const tvCenterTop = 90;

  const tvWithLogo = await sharp(cleanTV)
    .composite([
      { input: blurredLockup, left: tvCenterLeft, top: tvCenterTop }
    ])
    .png()
    .toBuffer();

  await sharp(tvWithLogo).toFile('C:/Users/iprtr/.gemini/antigravity/scratch/tv_test_preview.png');
  console.log('Saved tv_test_preview.png');

  // 7. Composite back into hero-murillo-bg.jpg safely
  const currentHeroBuf = fs.readFileSync(heroPath);
  const finalHero = await sharp(currentHeroBuf)
    .composite([
      { input: tvWithLogo, left: tvX, top: tvY }
    ])
    .jpeg({ quality: 96, chromaSubsampling: '4:4:4' })
    .toBuffer();

  const tempOut = path.join(__dirname, 'assets', 'images', 'hero-murillo-bg-temp.jpg');
  fs.writeFileSync(tempOut, finalHero);
  fs.renameSync(tempOut, heroPath);
  console.log('Updated hero-murillo-bg.jpg with official TV logo!');
}

updateTvLogo().catch(console.error);
