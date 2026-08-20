import { NextRequest } from "next/server";
import { getCampaignApiService } from "@/lib/briefd/persistence/api-service";
import {
  jsonResponse,
  notFound,
  routeError,
  validShareToken,
} from "@/lib/briefd/persistence/http";

export const runtime = "nodejs";
type Context = { params: Promise<{ token: string }> };

export async function GET(_request: NextRequest, { params }: Context) {
  try {
    const { token } = await params;
    if (!validShareToken(token)) return notFound("Shared campaign not found.");
    return jsonResponse(await getCampaignApiService().loadSharedCampaign(token));
  } catch (error) {
    return routeError(error);
  }
}
