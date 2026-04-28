import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const THEME = "#2E5E3E";
const SOURCE_LOGO = path.join(root, "public", "logo-clean.png");

function hexToRgb(hex) {
  const v = hex.replace("#", "");
  const r = parseInt(v.slice(0, 2), 16);
  const g = parseInt(v.slice(2, 4), 16);
  const b = parseInt(v.slice(4, 6), 16);
  return { r, g, b };
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  // "any" icons: transparent background, logo centered
  for (const s of [192, 512]) {
    await sharp(SOURCE_LOGO)
      .resize(s, s, {
        fit: "contain",
        background: { r: 0, g: 0, b: 0, alpha: 0 },
      })
      .png()
      .toFile(path.join(iconsDir, `icon-${s}.png`));
  }

  // "maskable" icon: solid theme background with safe padding
  const bg = sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { ...hexToRgb(THEME), alpha: 1 },
    },
  });

  const logoBuf = await sharp(SOURCE_LOGO)
    .resize(358, 358, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  await bg
    .composite([{ input: logoBuf, gravity: "center" }])
    .png()
    .toFile(path.join(iconsDir, "icon-512-maskable.png"));

  console.log("Wrote icons to public/icons/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
