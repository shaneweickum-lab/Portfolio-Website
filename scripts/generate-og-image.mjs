import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SOURCE = path.join(ROOT, "public", "images", "digital_hero.png");
const OUTPUT = path.join(ROOT, "public", "images", "og-hero.png");

// Pre-cropped to the exact Open Graph frame (1200x630) and re-encoded here,
// in a plain Node script, rather than inside the opengraph-image.tsx route
// itself: sharp's native binary can't load inside that route's bundled
// runtime, and the source file's AI-generation metadata chunks aren't
// parseable by the PNG decoder ImageResponse renders through anyway -- a
// clean re-encode sidesteps both problems at once.
await sharp(SOURCE).resize(1200, 630, { fit: "cover" }).png().toFile(OUTPUT);

console.log("Generated public/images/og-hero.png from digital_hero.png");
