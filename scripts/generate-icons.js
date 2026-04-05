import sharp from "sharp";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const iconsDir = path.join(__dirname, "..", "public", "icons");
const source = path.join(iconsDir, "logo.png");

async function generate() {
  // Standard icons (fit within bounds, white background)
  for (const size of [192, 512]) {
    await sharp(source)
      .resize(size, size, { fit: "contain", background: "#ffffff" })
      .png()
      .toFile(path.join(iconsDir, `icon-${size}.png`));
    console.log(`Generated icon-${size}.png`);
  }

  // Maskable icons (20% safe zone padding)
  for (const size of [192, 512]) {
    const innerSize = Math.round(size * 0.6);
    const padding = Math.round((size - innerSize) / 2);
    await sharp(source)
      .resize(innerSize, innerSize, { fit: "contain", background: "#ffffff" })
      .extend({
        top: padding,
        bottom: padding,
        left: padding,
        right: padding,
        background: "#ffffff",
      })
      .png()
      .toFile(path.join(iconsDir, `icon-maskable-${size}.png`));
    console.log(`Generated icon-maskable-${size}.png`);
  }

  // Apple touch icon (180x180)
  await sharp(source)
    .resize(180, 180, { fit: "contain", background: "#ffffff" })
    .png()
    .toFile(path.join(iconsDir, "apple-touch-icon.png"));
  console.log("Generated apple-touch-icon.png");
}

generate().catch(console.error);
