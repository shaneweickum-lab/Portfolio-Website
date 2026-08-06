import fs from "node:fs";
import path from "node:path";
import { ZipArchive } from "archiver";

const ROOT = process.cwd();
const SOURCE_ROOT = path.join(ROOT, "skills-source");
const OUTPUT_ROOT = path.join(ROOT, "public", "skills");

if (!fs.existsSync(SOURCE_ROOT)) {
  process.exit(0);
}

fs.mkdirSync(OUTPUT_ROOT, { recursive: true });

const slugs = fs
  .readdirSync(SOURCE_ROOT, { withFileTypes: true })
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name);

async function zipSkill(slug) {
  const sourceDir = path.join(SOURCE_ROOT, slug);
  const outputPath = path.join(OUTPUT_ROOT, `${slug}.zip`);

  await new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = new ZipArchive({ zlib: { level: 9 } });

    output.on("close", resolve);
    archive.on("error", reject);

    archive.pipe(output);
    archive.directory(sourceDir, slug);
    archive.finalize();
  });

  console.log(`Packaged skills-source/${slug} -> public/skills/${slug}.zip`);
}

for (const slug of slugs) {
  await zipSkill(slug);
}
