import { NextRequest } from "next/server";
import { getCampaignApiService } from "@/lib/briefd/persistence/api-service";
import {
  jsonResponse,
  parseCampaignDraft,
  readJson,
  requireSameOrigin,
  routeError,
  setOwnerCookie,
} from "@/lib/briefd/persistence/http";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    requireSameOrigin(request);
    const draft = parseCampaignDraft(await readJson(request));
    const created = await getCampaignApiService().createCampaign(draft);
    const response = jsonResponse(created.response, 201);
    setOwnerCookie(response, request, created.response.campaign.id, created.ownerSecret);
    return response;
  } catch (error) {
    return routeError(error);
  }
}
