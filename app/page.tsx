import {
  About,
  CTA,
  Career,
  Hero,
  Press,
  Proof,
  Video,
} from "@/components/Sections";
import BuilderBand from "@/components/BuilderBand";
import ScoreboardTeaser from "@/components/ScoreboardTeaser";
import { getBuildLog } from "@/lib/buildlog";
import { isOwnerRequest } from "@/lib/demos/owner";

/** Order per change-spec §1: About pillars → builder band (the claim) →
 *  metrics ribbon (the receipts) → the /building link (the deep dive).
 *  The contact section and the /building links are owner-only
 *  (lib/demos/owner.ts), so the page renders per request; the build log
 *  itself stays cached for an hour inside getBuildLog(). */
export default async function HomePage() {
  const [log, owner] = await Promise.all([getBuildLog(), isOwnerRequest()]);
  return (
    <>
      <Hero />
      <Proof />
      <About />
      <BuilderBand owner={owner} />
      <ScoreboardTeaser log={log} owner={owner} />
      <Video />
      <Career />
      <Press />
      {owner ? <CTA /> : null}
    </>
  );
}
