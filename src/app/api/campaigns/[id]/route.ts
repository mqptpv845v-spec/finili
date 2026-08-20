import { NextRequest } from "next/server";
import { getCampaignApiService } from "@/lib/briefd/persistence/api-service";
import {
  clearOwnerCookie,
  emptyResponse,
  jsonResponse,
  notFound,
  ownerSecret,
  parseCampaignUpdate,
  readJson,
  requireSameOrigin,
  routeError,
  validCampaignId,
} from "@/lib/briefd/persistence/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, { params }: Context) {
  try {
    const { id } = await params;
    const secret = validCampaignId(id) ? ownerSecret(request, id) : null;
    if (!secret) return notFound("Campaign not found.");
    return jsonResponse(await getCampaignApiService().loadOwnerCampaign(id, secret));
  } catch (error) {
    return routeError(error);
  }
}

export async function PUT(request: NextRequest, { params }: Context) {
  try {
    requireSameOrigin(request);
    const { id } = await params;
    const secret = validCampaignId(id) ? ownerSecret(request, id) : null;
    if (!secret) return notFound("Campaign not found.");
    const update = parseCampaignUpdate(await readJson(request), id);
    return jsonResponse(await getCampaignApiService().updateCampaign(update, secret));
  } catch (error) {
    return routeError(error);
  }
}

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    requireSameOrigin(request);
    const { id } = await params;
    const secret = validCampaignId(id) ? ownerSecret(request, id) : null;
    if (!secret) return notFound("Campaign not found.");
    await getCampaignApiService().deleteCampaign(id, secret);
    const response = emptyResponse();
    clearOwnerCookie(response, request, id);
    return response;
  } catch (error) {
    return routeError(error);
  }
}
