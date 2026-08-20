import { NextRequest } from "next/server";
import { getCampaignApiService } from "@/lib/briefd/persistence/api-service";
import {
  emptyResponse,
  notFound,
  ownerSecret,
  requireSameOrigin,
  routeError,
  validCampaignId,
  validShareId,
} from "@/lib/briefd/persistence/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ id: string; shareId: string }> };

export async function DELETE(request: NextRequest, { params }: Context) {
  try {
    requireSameOrigin(request);
    const { id, shareId } = await params;
    const secret = validCampaignId(id) && validShareId(shareId) ? ownerSecret(request, id) : null;
    if (!secret) return notFound("Share link not found.");
    await getCampaignApiService().revokeShare(id, shareId, secret);
    return emptyResponse();
  } catch (error) {
    return routeError(error);
  }
}
