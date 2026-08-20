import type { CampaignService } from "./service";
import { campaignService as repositoryCampaignService } from "./repository";

export type CampaignApiService = Pick<
  CampaignService,
  | "createCampaign"
  | "loadOwnerCampaign"
  | "updateCampaign"
  | "deleteCampaign"
  | "createShare"
  | "loadSharedCampaign"
  | "revokeShare"
>;

let testService: CampaignApiService | null = null;

export function getCampaignApiService(): CampaignApiService {
  return testService ?? repositoryCampaignService();
}

/** Route tests use this seam so they never need a database connection. */
export function setCampaignApiServiceForTests(service: CampaignApiService | null): void {
  testService = service;
}
