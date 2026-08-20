import { describe, expect, it } from "vitest";
import { assertCampaignSnapshot, sharedCampaign, unresolvedRowIds, type CampaignSnapshot } from "./contracts";
import { capabilityMatches, createCapabilitySecret, hashCapabilitySecret, requestHasSameOrigin } from "./security";

const snapshot: CampaignSnapshot = {
  id: "campaign-1", revision: 1, clientName: "Client", campaignName: "Launch",
  sheetName: "Plan", headerRow: 1, columnMapping: { publisher: 1, format: 2 },
  rows: [{ id: "row-1", source: { sheetName: "Plan", rowNumber: 2 }, campaign: "Launch", publisher: "Agency", format: "Custom", deadline: null, deadlineRaw: "", notes: "", rawValues: {} }],
  formats: [{ id: "row-1", categoryTag: "Display", publisher: "Agency", formatName: "Custom", sectionCategory: "Digital Display & High-Impact", dimensions: { width: 300, height: 250, unit: "px" }, deadline: null, requirements: {}, fileTypes: [], trust: "user-provided", sourceRow: { sheetName: "Plan", rowNumber: 2 } }],
};

describe("Briefd persistence security", () => {
  it("creates opaque 256-bit capability secrets and stores stable hashes", () => {
    const secret = createCapabilitySecret();
    expect(Buffer.from(secret, "base64url")).toHaveLength(32);
    expect(hashCapabilitySecret(secret)).toMatch(/^[a-f0-9]{64}$/);
    expect(capabilityMatches(secret, hashCapabilitySecret(secret))).toBe(true);
    expect(capabilityMatches(`${secret}x`, hashCapabilitySecret(secret))).toBe(false);
  });

  it("enforces same-origin mutation requests", () => {
    expect(requestHasSameOrigin(new Request("https://briefd.test/api", { headers: { origin: "https://briefd.test" } }))).toBe(true);
    expect(requestHasSameOrigin(new Request("https://briefd.test/api", { headers: { origin: "https://evil.test" } }))).toBe(false);
  });

  it("redacts import data from view-only campaign responses", () => {
    assertCampaignSnapshot(snapshot);
    const shared = sharedCampaign(snapshot);
    expect(shared.access).toBe("view");
    expect("rows" in shared.campaign).toBe(false);
    expect("sourceFilename" in shared.campaign).toBe(false);
  });

  it("blocks sharing while any imported row remains unresolved", () => {
    const unresolved = { ...snapshot, formats: [] };
    expect(unresolvedRowIds(unresolved)).toEqual(["row-1"]);
    expect(() => sharedCampaign(unresolved)).toThrow(/Resolve every/);
  });
});
