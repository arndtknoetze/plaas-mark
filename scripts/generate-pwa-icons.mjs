import { mkdir } from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const iconsDir = path.join(root, "public", "icons");
const THEME = "#2E5E3E";
const FG = "#ffffff";

function iconSvg(size, fontScale) {
  const fontSize = Math.round(size * fontScale);
  return `
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="${THEME}"/>
  <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle"
    font-family="system-ui,-apple-system,sans-serif" font-weight="700"
    font-size="${fontSize}" fill="${FG}">PM</text>
</svg>`.trim();
}

async function main() {
  await mkdir(iconsDir, { recursive: true });

  for (const s of [192, 512]) {
    const buf = Buffer.from(iconSvg(s, 0.28));
    await sharp(buf).png().toFile(path.join(iconsDir, `icon-${s}.png`));
  }

  const maskBuf = Buffer.from(iconSvg(512, 0.22));
  await sharp(maskBuf)
    .png()
    .toFile(path.join(iconsDir, "icon-512-maskable.png"));

  console.log("Wrote icons to public/icons/");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
