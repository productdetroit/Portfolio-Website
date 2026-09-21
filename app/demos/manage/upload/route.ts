/** Hands the browser a short-lived token to upload one video straight to
 *  Blob. The file never passes through a function — a Vercel function
 *  accepts ~4.5 MB per request and a walkthrough is hundreds of MB.
 *
 *  Only owners get a token, and only for a path shaped like
 *  demos/<slug>/<safe video name>. The demo's manifest is written
 *  separately by the save action once the upload has finished.
 *
 *  Lives under /demos because the session cookie is scoped to that path. */
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse, type NextRequest } from "next/server";
import { isSlug } from "@/lib/demos/manifest";
import { VIDEO_CONTENT_TYPES, VIDEO_MAX_BYTES, safeVideoName } from "@/lib/demos/video";
import { getViewer } from "@/lib/demos/session";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const viewer = await getViewer();
  if (!viewer?.owner) return NextResponse.json({ error: "owners only" }, { status: 403 });

  const body = (await request.json()) as HandleUploadBody;
  try {
    const json = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const m = pathname.match(/^demos\/([^/]+)\/([^/]+)$/);
        if (!m || !isSlug(m[1]) || safeVideoName(m[2]) !== m[2]) throw new Error(`refusing path ${pathname}`);
        return {
          allowedContentTypes: VIDEO_CONTENT_TYPES,
          maximumSizeInBytes: VIDEO_MAX_BYTES,
          addRandomSuffix: false,
          allowOverwrite: true,
          tokenPayload: JSON.stringify({ by: viewer.email }),
        };
      },
      // Blob calls this from its side after the upload lands. The save action
      // is what records the video on the demo, so nothing to do here.
      onUploadCompleted: async () => {},
    });
    return NextResponse.json(json);
  } catch (err) {
    console.error("[demos] upload token refused:", err instanceof Error ? err.message : err);
    return NextResponse.json({ error: err instanceof Error ? err.message : "upload refused" }, { status: 400 });
  }
}
