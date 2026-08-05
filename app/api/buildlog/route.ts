import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";
import { BUILDLOG_CACHE_TAGS, getBuildLog } from "@/lib/buildlog";
import { isProductionShip, signatureMatches } from "@/lib/buildlog/webhook";

export const dynamic = "force-dynamic";

/** Debug and manual-refresh path only — the pages call getBuildLog()
 *  directly (spec 7.1). `?refresh=1` drops all four provider caches first. */
export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("refresh") === "1") {
    for (const tag of BUILDLOG_CACHE_TAGS) revalidateTag(tag, "max");
  }
  return NextResponse.json(await getBuildLog());
}

/** Vercel deploy webhook (app.tophand.ag · deployment.succeeded): a
 *  production ship drops all four provider caches so the register updates
 *  within seconds instead of waiting out the hourly revalidate window. */
export async function POST(request: NextRequest) {
  const secret = process.env.VERCEL_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "webhook not configured" }, { status: 503 });
  }

  const body = await request.text();
  const signature = request.headers.get("x-vercel-signature");
  if (!signatureMatches(body, signature, secret)) {
    return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  }

  let event: unknown;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: "invalid payload" }, { status: 400 });
  }

  const refreshed = isProductionShip(event);
  if (refreshed) {
    for (const tag of BUILDLOG_CACHE_TAGS) revalidateTag(tag, "max");
  }
  return NextResponse.json({ refreshed });
}
