import { NextRequest } from "next/server";
import { getCampaignApiService } from "@/lib/briefd/persistence/api-service";
import {
  jsonResponse,
  notFound,
  ownerSecret,
  parseShareOptions,
  readJson,
  requireSameOrigin,
  routeError,
  validCampaignId,
} from "@/lib/briefd/persistence/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string }> };

export async function POST(request: NextRequest, { params }: Context) {
  try {
    requireSameOrigin(request);
    const { id } = await params;
    const secret = validCampaignId(id) ? ownerSecret(request, id) : null;
    if (!secret) return notFound("Campaign not found.");
    const { expiresAt } = parseShareOptions(await readJson(request, { allowEmpty: true }));
    return jsonResponse(await getCampaignApiService().createShare(id, secret, expiresAt), 201);
  } catch (error) {
    return routeError(error);
  }
}
