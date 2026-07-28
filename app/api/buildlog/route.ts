import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BUILDLOG_CACHE_TAGS, getBuildLog } from "@/lib/buildlog";

export const dynamic = "force-dynamic";

/** Debug and manual-refresh path only — the pages call getBuildLog()
 *  directly (spec 7.1). `?refresh=1` drops all four provider caches first. */
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("refresh") === "1") {
    for (const tag of BUILDLOG_CACHE_TAGS) revalidateTag(tag, "max");
  }
  return NextResponse.json(await getBuildLog());
}
