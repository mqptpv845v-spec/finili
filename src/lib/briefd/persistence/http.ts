import { NextRequest, NextResponse } from "next/server";
import { assertCampaignSnapshot, type CampaignSnapshot } from "./contracts";
import { requestHasSameOrigin } from "./security";
import {
  PersistenceError,
  type CampaignDraft,
  type CampaignUpdate,
  type ResolutionInput,
} from "./service";

const MAX_JSON_BYTES = 1024 * 1024;
const OWNER_COOKIE_PREFIX = "briefd_owner_";
const OWNER_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const CAPABILITY = /^[A-Za-z0-9_-]{43}$/;

type JsonStatus = 200 | 201 | 400 | 403 | 404 | 409 | 413 | 415 | 500;

class ApiRequestError extends Error {
  constructor(readonly status: JsonStatus, readonly publicMessage: string) {
    super(publicMessage);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value && typeof value === "object" && !Array.isArray(value));
}

function assertAllowedKeys(value: Record<string, unknown>, allowed: readonly string[]): void {
  const allowedSet = new Set(allowed);
  if (Object.keys(value).some((key) => !allowedSet.has(key))) throw new Error("Unexpected property.");
}

function assertOptionalString(value: unknown): void {
  if (value !== undefined && typeof value !== "string") throw new Error("Expected a string.");
}

function assertResolutionInput(value: unknown): asserts value is ResolutionInput {
  if (!isRecord(value) || typeof value.rowId !== "string" || !value.rowId) throw new Error("Invalid resolution.");
  if (value.kind === "brain") {
    assertAllowedKeys(value, ["rowId", "kind", "specId", "deadline", "deadlineRaw", "notes", "metadata"]);
    if (typeof value.specId !== "string" || !value.specId) throw new Error("Invalid Brain resolution.");
    if (value.deadline !== null && (typeof value.deadline !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.deadline))) {
      throw new Error("Invalid deadline.");
    }
    assertOptionalString(value.deadlineRaw);
    assertOptionalString(value.notes);
    assertOptionalString(value.metadata);
    return;
  }
  if (value.kind !== "manual" || !isRecord(value.format)) throw new Error("Invalid manual resolution.");
  assertAllowedKeys(value, ["rowId", "kind", "format"]);
  assertAllowedKeys(value.format, [
    "categoryTag", "publisher", "formatName", "sectionCategory", "dimensions", "deadline",
    "deadlineRaw", "requirements", "fileTypes", "notes", "metadata",
  ]);
  if (!isRecord(value.format.dimensions) || !isRecord(value.format.requirements)) throw new Error("Invalid format.");
  assertAllowedKeys(value.format.dimensions, ["width", "height", "unit", "visibleWidth", "visibleHeight"]);
  for (const key of ["visibleWidth", "visibleHeight"] as const) {
    const dimension = value.format.dimensions[key];
    if (dimension !== undefined && (typeof dimension !== "number" || !Number.isFinite(dimension) || dimension <= 0)) {
      throw new Error("Invalid visible dimension.");
    }
  }
  assertAllowedKeys(value.format.requirements, [
    "bleedMm", "textSafeMm", "imageSafeMm", "maxFileSizeKb", "resolutionDpi",
    "durationSeconds", "colorProfile",
  ]);
  assertOptionalString(value.format.deadlineRaw);
  assertOptionalString(value.format.notes);
  assertOptionalString(value.format.metadata);
}

function campaignWrite(value: unknown, update: boolean): CampaignDraft | CampaignUpdate {
  try {
    if (!isRecord(value)) throw new Error("Invalid campaign.");
    assertAllowedKeys(value, update
      ? ["id", "revision", "clientName", "campaignName", "sourceFilename", "sheetName", "headerRow", "columnMapping", "rows", "resolutions"]
      : ["clientName", "campaignName", "sourceFilename", "sheetName", "headerRow", "columnMapping", "rows", "resolutions"]);
    if (typeof value.clientName !== "string" || !value.clientName.trim() || typeof value.campaignName !== "string" || !value.campaignName.trim()) {
      throw new Error("Campaign labels are required.");
    }
    assertOptionalString(value.sourceFilename);
    if (!Array.isArray(value.rows) || !Array.isArray(value.resolutions)) throw new Error("Campaign rows are invalid.");
    for (const row of value.rows) {
      if (!isRecord(row)) throw new Error("Campaign row is invalid.");
      assertAllowedKeys(row, ["id", "source", "campaign", "publisher", "format", "deadline", "deadlineRaw", "notes", "rawValues"]);
      if (!isRecord(row.source)) throw new Error("Campaign row source is invalid.");
      assertAllowedKeys(row.source, ["sheetName", "rowNumber"]);
    }
    for (const resolution of value.resolutions) assertResolutionInput(resolution);

    const rowById = new Map(value.rows.map((row) => [String((row as Record<string, unknown>).id), row as Record<string, unknown>]));
    const manualFormats = (value.resolutions as ResolutionInput[])
      .filter((resolution) => resolution.kind === "manual")
      .map((resolution) => {
        const source = rowById.get(resolution.rowId)?.source as { sheetName?: unknown; rowNumber?: unknown } | undefined;
        return {
          ...resolution.format,
          id: resolution.rowId,
          trust: "user-provided" as const,
          sourceRow: source && typeof source.sheetName === "string" && typeof source.rowNumber === "number"
            ? { sheetName: source.sheetName, rowNumber: source.rowNumber }
            : undefined,
        };
      });
    const validationSnapshot: CampaignSnapshot = {
      ...(value as unknown as Omit<CampaignSnapshot, "id" | "revision" | "formats">),
      id: update ? String(value.id ?? "") : "00000000-0000-4000-8000-000000000000",
      revision: update ? Number(value.revision) : 1,
      formats: manualFormats,
    };
    assertCampaignSnapshot(validationSnapshot);
    return value as unknown as CampaignDraft | CampaignUpdate;
  } catch {
    throw new ApiRequestError(400, "Campaign payload is invalid.");
  }
}

async function readBodyBytes(request: Request): Promise<Uint8Array> {
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_JSON_BYTES) {
    throw new ApiRequestError(413, "Request body is too large.");
  }
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.byteLength;
    if (total > MAX_JSON_BYTES) {
      await reader.cancel();
      throw new ApiRequestError(413, "Request body is too large.");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return bytes;
}

export async function readJson(request: Request, options: { allowEmpty?: boolean } = {}): Promise<unknown> {
  const mediaType = request.headers.get("content-type")?.split(";", 1)[0].trim().toLowerCase();
  if (mediaType !== "application/json") throw new ApiRequestError(415, "Content-Type must be application/json.");
  const bytes = await readBodyBytes(request);
  if (bytes.byteLength === 0 && options.allowEmpty) return {};
  try {
    return JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) as unknown;
  } catch {
    throw new ApiRequestError(400, "Request body must contain valid JSON.");
  }
}

export function parseCampaignDraft(value: unknown): CampaignDraft {
  return campaignWrite(value, false) as CampaignDraft;
}

export function parseCampaignUpdate(value: unknown, campaignId: string): CampaignUpdate {
  const update = campaignWrite(value, true) as CampaignUpdate;
  if (update.id !== campaignId) throw new ApiRequestError(400, "Campaign id does not match the request path.");
  return update;
}

export function parseShareOptions(value: unknown): { expiresAt: string | null } {
  if (!isRecord(value)) throw new ApiRequestError(400, "Share payload is invalid.");
  try {
    assertAllowedKeys(value, ["expiresAt"]);
  } catch {
    throw new ApiRequestError(400, "Share payload is invalid.");
  }
  const expiresAt = value.expiresAt ?? null;
  if (expiresAt !== null && (typeof expiresAt !== "string" || !Number.isFinite(Date.parse(expiresAt)))) {
    throw new ApiRequestError(400, "Share expiry must be a valid date.");
  }
  return { expiresAt };
}

export function requireSameOrigin(request: Request): void {
  if (!requestHasSameOrigin(request)) throw new ApiRequestError(403, "Request origin is not allowed.");
}

export function validCampaignId(value: string): boolean {
  return UUID.test(value);
}

export function validShareToken(value: string): boolean {
  return CAPABILITY.test(value);
}

export function validShareId(value: string): boolean {
  return UUID.test(value);
}

export function ownerCookieName(campaignId: string): string {
  return `${OWNER_COOKIE_PREFIX}${campaignId}`;
}

export function ownerSecret(request: NextRequest, campaignId: string): string | null {
  const secret = request.cookies.get(ownerCookieName(campaignId))?.value ?? null;
  return secret && CAPABILITY.test(secret) ? secret : null;
}

export function setOwnerCookie(response: NextResponse, request: Request, campaignId: string, secret: string): void {
  response.cookies.set(ownerCookieName(campaignId), secret, {
    httpOnly: true,
    sameSite: "strict",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: OWNER_COOKIE_MAX_AGE_SECONDS,
  });
}

export function clearOwnerCookie(response: NextResponse, request: Request, campaignId: string): void {
  response.cookies.set(ownerCookieName(campaignId), "", {
    httpOnly: true,
    sameSite: "strict",
    secure: new URL(request.url).protocol === "https:",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export function jsonResponse(body: unknown, status: 200 | 201 = 200): NextResponse {
  return NextResponse.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function emptyResponse(): NextResponse {
  return new NextResponse(null, { status: 204, headers: { "Cache-Control": "no-store" } });
}

export function notFound(message: "Campaign not found." | "Shared campaign not found." | "Share link not found."): NextResponse {
  return jsonError(404, message);
}

export function routeError(error: unknown): NextResponse {
  if (error instanceof ApiRequestError) return jsonError(error.status, error.publicMessage);
  if (error instanceof PersistenceError) return jsonError(error.status, error.message);
  console.error("Briefd campaign API failed:", error instanceof Error ? error.name : "UnknownError");
  return jsonError(500, "The request could not be completed.");
}

function jsonError(status: JsonStatus, message: string): NextResponse {
  return NextResponse.json({ error: message }, { status, headers: { "Cache-Control": "no-store" } });
}
