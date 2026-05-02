import sharp from "sharp";
import { copyFileSync, existsSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const PUBLIC = join(ROOT, "public");
const ICONS_DIR = join(PUBLIC, "icons");
const SOURCE = "C:\\Users\\nugro\\.gemini\\antigravity\\brain\\ec6d7e59-6457-4c36-951d-ae295a809847\\eperpus_icon_1777720034760.png";

if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true });

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

for (const size of sizes) {
  await sharp(SOURCE)
    .resize(size, size)
    .png()
    .toFile(join(ICONS_DIR, `icon-${size}x${size}.png`));
  console.log(`✅ icon-${size}x${size}.png`);
}

// Apple touch icon (180x180)
await sharp(SOURCE)
  .resize(180, 180)
  .png()
  .toFile(join(PUBLIC, "apple-touch-icon.png"));
console.log("✅ apple-touch-icon.png");

// favicon 32x32
await sharp(SOURCE)
  .resize(32, 32)
  .png()
  .toFile(join(PUBLIC, "favicon-32x32.png"));
console.log("✅ favicon-32x32.png");

// Also copy to root as favicon.ico placeholder
await sharp(SOURCE)
  .resize(32, 32)
  .png()
  .toFile(join(PUBLIC, "favicon.png"));
console.log("✅ favicon.png");

console.log("\n🎉 Semua icon berhasil digenerate!");
