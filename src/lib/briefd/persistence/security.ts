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

function firstForwardedValue(value: string | null): string | null {
  const first = value?.split(",", 1)[0]?.trim();
  return first || null;
}

function publicProtocol(request: Request): "http:" | "https:" {
  const forwarded = firstForwardedValue(request.headers.get("x-forwarded-proto"))?.toLowerCase();
  if (forwarded === "http" || forwarded === "https") return `${forwarded}:`;
  return new URL(request.url).protocol === "https:" ? "https:" : "http:";
}

function headerOrigin(protocol: string, host: string | null): string | null {
  if (!host) return null;
  try { return new URL(`${protocol}//${host}`).origin; }
  catch { return null; }
}

export function requestHasSameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const suppliedOrigin = new URL(origin).origin;
    const protocol = publicProtocol(request);
    const allowedOrigins = new Set<string>([new URL(request.url).origin]);
    const hostOrigin = headerOrigin(protocol, firstForwardedValue(request.headers.get("host")));
    const forwardedOrigin = headerOrigin(protocol, firstForwardedValue(request.headers.get("x-forwarded-host")));
    if (hostOrigin) allowedOrigins.add(hostOrigin);
    if (forwardedOrigin) allowedOrigins.add(forwardedOrigin);
    return allowedOrigins.has(suppliedOrigin);
  }
  catch { return false; }
}

export function requestUsesHttps(request: Request): boolean {
  return publicProtocol(request) === "https:";
}
