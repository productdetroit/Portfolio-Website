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

export const revalidate = 3600;

/** Order per change-spec §1: About pillars → builder band (the claim) →
 *  metrics ribbon (the receipts) → the /building link (the deep dive). */
export default async function HomePage() {
  const log = await getBuildLog();
  return (
    <>
      <Hero />
      <Proof />
      <About />
      <BuilderBand />
      <ScoreboardTeaser log={log} />
      <Video />
      <Career />
      <Press />
      <CTA />
    </>
  );
}
