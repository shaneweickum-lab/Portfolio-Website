import crypto from "crypto";

const jwtSecret = process.env.ADMIN_JWT_SECRET || "dev-secret-key";

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=/g, "");
}

function base64UrlDecode(data: string): string {
  let decoded = data.replace(/-/g, "+").replace(/_/g, "/");
  decoded += "=".repeat((4 - (decoded.length % 4)) % 4);
  return Buffer.from(decoded, "base64").toString();
}

export function generateAdminToken(adminId: string): string {
  const header = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64UrlEncode(
    JSON.stringify({
      adminId,
      iat: now,
      exp: now + 7 * 24 * 60 * 60,
    })
  );

  const signature = base64UrlEncode(
    crypto
      .createHmac("sha256", jwtSecret)
      .update(`${header}.${payload}`)
      .digest("hex")
  );

  return `${header}.${payload}.${signature}`;
}

export function verifyAdminToken(token: string): { adminId: string } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [headerB64, payloadB64, signatureB64] = parts;

    const expectedSignature = base64UrlEncode(
      crypto
        .createHmac("sha256", jwtSecret)
        .update(`${headerB64}.${payloadB64}`)
        .digest("hex")
    );

    if (signatureB64 !== expectedSignature) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    const now = Math.floor(Date.now() / 1000);

    if (payload.exp < now) return null;

    return { adminId: payload.adminId };
  } catch {
    return null;
  }
}

export function getAdminTokenFromHeaders(headers: Headers) {
  const authHeader = headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7);
}
