import { createHash, randomBytes, timingSafeEqual } from "node:crypto";

const SECRET_BYTES = 32;

export function createCapabilitySecret(): string {
  return randomBytes(SECRET_BYTES).toString("base64url");
}

export function hashCapabilitySecret(secret: string): string {
  return createHash("sha256").update(secret, "utf8").digest("hex");
}

export function capabilityMatches(secret: string, expectedHash: string): boolean {
  const actual = Buffer.from(hashCapabilitySecret(secret), "hex");
  const expected = Buffer.from(expectedHash, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function requestHasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try { return new URL(origin).origin === new URL(request.url).origin; }
  catch { return false; }
}
