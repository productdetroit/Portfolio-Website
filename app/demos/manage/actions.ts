"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { demoFromFields } from "@/lib/demos/editor";
import { isSlug, serializeDemo } from "@/lib/demos/manifest";
import { getViewer } from "@/lib/demos/session";
import { deleteDemo, demoFileExists, getDemo, saveDemoManifest } from "@/lib/demos/store";

async function requireOwner() {
  const viewer = await getViewer();
  if (!viewer?.owner) redirect("/demos");
  return viewer;
}

const str = (f: FormData, k: string) => (typeof f.get(k) === "string" ? (f.get(k) as string).trim() : "");

/** Create or update. The video (if any) was already uploaded by the browser
 *  to demos/<slug>/<video>; we confirm it's there before pointing at it. */
export async function saveDemo(formData: FormData): Promise<void> {
  await requireOwner();
  const creating = str(formData, "mode") === "create";
  const slug = str(formData, "slug").toLowerCase();
  const back = (error: string): never =>
    redirect(`/demos/manage/${creating ? "new" : slug}?${new URLSearchParams({ error })}`);

  if (!isSlug(slug)) return back("URL name must be lowercase letters, digits and hyphens, like motor-quote.");
  const existing = await getDemo(slug);
  if (creating && existing) return back(`/demos/${slug} already exists — pick another URL name or edit that one.`);
  if (!creating && !existing) redirect("/demos/manage");

  const parsed = demoFromFields(Object.fromEntries(formData), slug);
  if (!parsed.ok) return back(parsed.error);
  const { demo } = parsed;
  if (demo.video && !(await demoFileExists(slug, demo.video))) return back("The video upload didn't finish — try it again.");

  try {
    await saveDemoManifest(slug, serializeDemo(demo), demo.video);
  } catch (err) {
    console.error("[demos] save failed:", err instanceof Error ? err.message : err);
    return back("Couldn't save just now. Try again.");
  }
  revalidatePath("/demos");
  revalidatePath("/demos/manage");
  /* Unique per save: the edit page keys the editor on it, so a fresh editor
     mounts after every successful save (state reset, fields re-read). */
  redirect(`/demos/manage/${slug}?saved=${Date.now()}`);
}

/** Removes the folder — manifest and video. Invitations for it are left in
 *  place (they're harmless and the log keeps its history). */
export async function removeDemo(formData: FormData): Promise<void> {
  await requireOwner();
  const slug = str(formData, "slug");
  if (!isSlug(slug)) redirect("/demos/manage");
  try {
    await deleteDemo(slug);
  } catch (err) {
    console.error("[demos] delete failed:", err instanceof Error ? err.message : err);
    redirect(`/demos/manage/${slug}?${new URLSearchParams({ error: "Couldn't delete just now. Try again." })}`);
  }
  revalidatePath("/demos");
  revalidatePath("/demos/manage");
  redirect(`/demos/manage?deleted=${slug}`);
}
