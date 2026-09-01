import { readFile } from "node:fs/promises";
import path from "node:path";
import { ImageResponse } from "next/og";
import { heroLede, positioning } from "@/data/engineering-philosophy";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Shane Weickum — AI Systems Engineer & AI Consulting";

async function loadGoogleFont(weight: 400 | 700): Promise<ArrayBuffer | null> {
  try {
    const css = await fetch(
      `https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@${weight}&display=swap`,
    ).then((res) => res.text());
    const match = css.match(/src: url\((.+?)\) format\('(?:woff2|truetype)'\)/);
    if (!match) return null;
    return await fetch(match[1]).then((res) => res.arrayBuffer());
  } catch {
    return null;
  }
}

export default async function Image() {
  const [heroImage, regular, bold] = await Promise.all([
    // Pre-cropped to the exact OG frame and re-encoded via `sharp` ahead of
    // time (see scripts/generate-og-hero.mjs) -- the source hero file's
    // AI-generation metadata chunks aren't parseable by the PNG decoder
    // ImageResponse renders through, so the raw file fails at request time.
    readFile(path.join(process.cwd(), "public/images/og-hero.png")),
    loadGoogleFont(400),
    loadGoogleFont(700),
  ]);
  const heroImageSrc = `data:image/png;base64,${heroImage.toString("base64")}`;

  const fonts = [
    regular && { name: "Space Grotesk", data: regular, weight: 400 as const, style: "normal" as const },
    bold && { name: "Space Grotesk", data: bold, weight: 700 as const, style: "normal" as const },
  ].filter((f): f is NonNullable<typeof f> => Boolean(f));
  const fontFamily = fonts.length > 0 ? "Space Grotesk" : "sans-serif";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          position: "relative",
          backgroundColor: "#0d1117",
          fontFamily,
        }}
      >
        <img
          src={heroImageSrc}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(0deg, #0d1117 18%, rgba(13,17,23,0.55) 55%, rgba(13,17,23,0.35) 100%)",
          }}
        />
        <div style={{ position: "relative", display: "flex", flexDirection: "column", padding: "64px 72px" }}>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 700,
              letterSpacing: 4,
              textTransform: "uppercase",
              color: "#e3a857",
            }}
          >
            AI Systems Engineering · AI Consulting
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 20,
              fontSize: 88,
              fontWeight: 700,
              color: "#f3f6f9",
              letterSpacing: -1,
            }}
          >
            Shane Weickum
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 24,
              fontSize: 34,
              fontWeight: 400,
              color: "rgba(243,246,249,0.88)",
              maxWidth: 980,
            }}
          >
            {heroLede.title}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 16,
              fontSize: 22,
              fontWeight: 400,
              color: "rgba(243,246,249,0.6)",
              maxWidth: 900,
            }}
          >
            {positioning.title}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts },
  );
}
