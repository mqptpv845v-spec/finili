import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import type { OwnerCampaignResponse, SharedCampaignResponse } from "@/lib/briefd/persistence/contracts";
import {
  setCampaignApiServiceForTests,
  type CampaignApiService,
} from "@/lib/briefd/persistence/api-service";
import { PersistenceError, type CampaignDraft } from "@/lib/briefd/persistence/service";
import { POST as createCampaign } from "./route";
import { DELETE as deleteCampaign, GET as getCampaign, PUT as updateCampaign } from "./[id]/route";
import { POST as createShare } from "./[id]/shares/route";
import { DELETE as revokeShare } from "./[id]/shares/[shareId]/route";
import { GET as getSharedCampaign } from "../shares/[token]/route";

const CAMPAIGN_ID = "123e4567-e89b-42d3-a456-426614174000";
const SHARE_ID = "223e4567-e89b-42d3-a456-426614174000";
const OWNER_SECRET = "o".repeat(43);
const SHARE_TOKEN = "s".repeat(43);
const OWNER_COOKIE = `briefd_owner_${CAMPAIGN_ID}=${OWNER_SECRET}`;

const row = {
  id: "Plan:2:abc123",
  source: { sheetName: "Plan", rowNumber: 2 },
  campaign: "Launch",
  publisher: "Publisher",
  format: "Format",
  deadline: "2026-09-01",
  deadlineRaw: "1 September 2026",
  notes: "",
  rawValues: { Publisher: "Publisher", Format: "Format" },
};

const draft: CampaignDraft = {
  clientName: "Client",
  campaignName: "Launch",
  sourceFilename: "plan.xlsx",
  sheetName: "Plan",
  headerRow: 1,
  columnMapping: { publisher: 1, format: 2 },
  rows: [row],
  resolutions: [],
};

const { resolutions: _resolutions, ...draftFields } = draft;
void _resolutions;

const ownerResponse: OwnerCampaignResponse = {
  access: "edit",
  campaign: {
    ...draftFields,
    id: CAMPAIGN_ID,
    revision: 1,
    formats: [],
  },
  shares: [],
};

const sharedResponse: SharedCampaignResponse = {
  access: "view",
  campaign: {
    id: CAMPAIGN_ID,
    revision: 1,
    clientName: "Client",
    campaignName: "Launch",
    formats: [],
  },
};

function mockService(): CampaignApiService {
  return {
    createCampaign: vi.fn(async () => ({ ownerSecret: OWNER_SECRET, response: ownerResponse })),
    loadOwnerCampaign: vi.fn(async () => ownerResponse),
    updateCampaign: vi.fn(async () => ownerResponse),
    deleteCampaign: vi.fn(async () => undefined),
    createShare: vi.fn(async () => ({ id: SHARE_ID, token: SHARE_TOKEN })),
    loadSharedCampaign: vi.fn(async () => sharedResponse),
    revokeShare: vi.fn(async () => undefined),
  };
}

function jsonRequest(path: string, method: "POST" | "PUT", body: unknown, headers: Record<string, string> = {}): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: { "content-type": "application/json", origin: "http://localhost", ...headers },
    body: JSON.stringify(body),
  });
}

function ownerRequest(path: string, method: "GET" | "DELETE"): NextRequest {
  return new NextRequest(`http://localhost${path}`, {
    method,
    headers: method === "DELETE"
      ? { cookie: OWNER_COOKIE, origin: "http://localhost" }
      : { cookie: OWNER_COOKIE },
  });
}

function context<T extends Record<string, string>>(params: T): { params: Promise<T> } {
  return { params: Promise.resolve(params) };
}

let service: CampaignApiService;

beforeEach(() => {
  service = mockService();
  setCampaignApiServiceForTests(service);
});

afterEach(() => {
  setCampaignApiServiceForTests(null);
  vi.restoreAllMocks();
});

describe("Briefd campaign API routes", () => {
  it("creates a campaign and stores only the owner capability in a hardened cookie", async () => {
    const response = await createCampaign(jsonRequest("/api/campaigns", "POST", draft));

    expect(response.status).toBe(201);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual(ownerResponse);
    expect(service.createCampaign).toHaveBeenCalledWith(draft);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`briefd_owner_${CAMPAIGN_ID}=${OWNER_SECRET}`);
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=strict");
    expect(cookie).toContain("Path=/");
    expect(cookie).not.toContain("Secure");
  });

  it("rejects cross-origin and oversized mutations before calling the service", async () => {
    const foreign = await createCampaign(jsonRequest("/api/campaigns", "POST", draft, { origin: "https://attacker.invalid" }));
    expect(foreign.status).toBe(403);
    expect(foreign.headers.get("cache-control")).toBe("no-store");

    const oversized = await createCampaign(jsonRequest("/api/campaigns", "POST", draft, {
      "content-length": String(1024 * 1024 + 1),
    }));
    expect(oversized.status).toBe(413);
    expect(service.createCampaign).not.toHaveBeenCalled();
  });

  it("rejects malformed payloads and fields that could inject server-owned trust", async () => {
    const response = await createCampaign(jsonRequest("/api/campaigns", "POST", {
      ...draft,
      resolutions: [{
        rowId: row.id,
        kind: "manual",
        format: {
          id: row.id,
          trust: "verified",
          categoryTag: "Display",
          publisher: "Publisher",
          formatName: "Format",
          sectionCategory: "Digital Display & High-Impact",
          dimensions: { width: 300, height: 250, unit: "px" },
          deadline: null,
          requirements: {},
          fileTypes: ["jpg"],
        },
      }],
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Campaign payload is invalid." });
    expect(service.createCampaign).not.toHaveBeenCalled();
  });

  it("rejects impossible calendar dates before persistence", async () => {
    const response = await createCampaign(jsonRequest("/api/campaigns", "POST", {
      ...draft,
      rows: [{ ...row, deadline: "2026-02-31" }],
    }));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({ error: "Campaign payload is invalid." });
    expect(service.createCampaign).not.toHaveBeenCalled();
  });

  it("rejects malformed optional manual-format fields before persistence", async () => {
    const manualFormat = {
      categoryTag: "Display",
      publisher: "Publisher",
      formatName: "Format",
      sectionCategory: "Digital Display & High-Impact",
      dimensions: { width: 300, height: 250, unit: "px" },
      deadline: null,
      requirements: {},
      fileTypes: ["jpg"],
    };
    const malformedFormats = [
      { ...manualFormat, deadlineRaw: { raw: "tomorrow" } },
      { ...manualFormat, notes: ["internal"] },
      { ...manualFormat, metadata: { wave: 1 } },
      { ...manualFormat, dimensions: { ...manualFormat.dimensions, visibleWidth: -1 } },
      { ...manualFormat, dimensions: { ...manualFormat.dimensions, visibleHeight: "200" } },
    ];

    for (const format of malformedFormats) {
      const response = await createCampaign(jsonRequest("/api/campaigns", "POST", {
        ...draft,
        resolutions: [{ rowId: row.id, kind: "manual", format }],
      }));
      expect(response.status).toBe(400);
      await expect(response.json()).resolves.toEqual({ error: "Campaign payload is invalid." });
    }
    expect(service.createCampaign).not.toHaveBeenCalled();
  });

  it("loads an owner campaign only when its per-campaign cookie is present", async () => {
    const response = await getCampaign(ownerRequest(`/api/campaigns/${CAMPAIGN_ID}`, "GET"), context({ id: CAMPAIGN_ID }));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual(ownerResponse);
    expect(service.loadOwnerCampaign).toHaveBeenCalledWith(CAMPAIGN_ID, OWNER_SECRET);

    const missing = await getCampaign(
      new NextRequest(`http://localhost/api/campaigns/${CAMPAIGN_ID}`),
      context({ id: CAMPAIGN_ID }),
    );
    expect(missing.status).toBe(404);
    expect(service.loadOwnerCampaign).toHaveBeenCalledTimes(1);
  });

  it("binds updates to the path campaign id", async () => {
    const response = await updateCampaign(
      jsonRequest(`/api/campaigns/${CAMPAIGN_ID}`, "PUT", {
        ...draft,
        id: "323e4567-e89b-42d3-a456-426614174000",
        revision: 1,
      }, { cookie: OWNER_COOKIE }),
      context({ id: CAMPAIGN_ID }),
    );
    expect(response.status).toBe(400);
    expect(service.updateCampaign).not.toHaveBeenCalled();
  });

  it("deletes an owned campaign and expires its capability cookie", async () => {
    const response = await deleteCampaign(
      ownerRequest(`/api/campaigns/${CAMPAIGN_ID}`, "DELETE"),
      context({ id: CAMPAIGN_ID }),
    );
    expect(response.status).toBe(204);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(service.deleteCampaign).toHaveBeenCalledWith(CAMPAIGN_ID, OWNER_SECRET);
    const cookie = response.headers.get("set-cookie") ?? "";
    expect(cookie).toContain(`briefd_owner_${CAMPAIGN_ID}=`);
    expect(cookie).toContain("Max-Age=0");
    expect(cookie).toContain("HttpOnly");
    expect(cookie).toContain("SameSite=strict");
  });

  it("creates and revokes view-only capabilities through owner-authenticated routes", async () => {
    const created = await createShare(
      jsonRequest(`/api/campaigns/${CAMPAIGN_ID}/shares`, "POST", { expiresAt: "2026-09-30T12:00:00.000Z" }, { cookie: OWNER_COOKIE }),
      context({ id: CAMPAIGN_ID }),
    );
    expect(created.status).toBe(201);
    await expect(created.json()).resolves.toEqual({ id: SHARE_ID, token: SHARE_TOKEN });
    expect(service.createShare).toHaveBeenCalledWith(CAMPAIGN_ID, OWNER_SECRET, "2026-09-30T12:00:00.000Z");

    const revoked = await revokeShare(
      ownerRequest(`/api/campaigns/${CAMPAIGN_ID}/shares/${SHARE_ID}`, "DELETE"),
      context({ id: CAMPAIGN_ID, shareId: SHARE_ID }),
    );
    expect(revoked.status).toBe(204);
    expect(service.revokeShare).toHaveBeenCalledWith(CAMPAIGN_ID, SHARE_ID, OWNER_SECRET);
  });

  it("loads a shared campaign without an owner cookie and rejects malformed tokens without lookup", async () => {
    const response = await getSharedCampaign(
      new NextRequest(`http://localhost/api/shares/${SHARE_TOKEN}`),
      context({ token: SHARE_TOKEN }),
    );
    expect(response.status).toBe(200);
    expect(response.headers.get("cache-control")).toBe("no-store");
    await expect(response.json()).resolves.toEqual(sharedResponse);
    expect(service.loadSharedCampaign).toHaveBeenCalledWith(SHARE_TOKEN);

    const malformed = await getSharedCampaign(
      new NextRequest("http://localhost/api/shares/not-a-capability"),
      context({ token: "not-a-capability" }),
    );
    expect(malformed.status).toBe(404);
    expect(service.loadSharedCampaign).toHaveBeenCalledTimes(1);
  });

  it("preserves safe service statuses but never returns unexpected database details", async () => {
    vi.mocked(service.loadOwnerCampaign).mockRejectedValueOnce(new PersistenceError("Campaign changed since it was loaded.", 409));
    const conflict = await getCampaign(ownerRequest(`/api/campaigns/${CAMPAIGN_ID}`, "GET"), context({ id: CAMPAIGN_ID }));
    expect(conflict.status).toBe(409);

    vi.spyOn(console, "error").mockImplementation(() => undefined);
    vi.mocked(service.loadSharedCampaign).mockRejectedValueOnce(new Error('relation "briefd_campaigns" does not exist'));
    const failure = await getSharedCampaign(
      new NextRequest(`http://localhost/api/shares/${SHARE_TOKEN}`),
      context({ token: SHARE_TOKEN }),
    );
    expect(failure.status).toBe(500);
    const serialized = JSON.stringify(await failure.json());
    expect(serialized).toBe('{"error":"The request could not be completed."}');
    expect(serialized).not.toContain("briefd_campaigns");
    expect(serialized).not.toContain("relation");
  });
});
