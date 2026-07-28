import {
  About,
  CTA,
  Career,
  Hero,
  Press,
  Proof,
  Video,
} from "@/components/Sections";
import ScoreboardTeaser from "@/components/ScoreboardTeaser";
import { getBuildLog } from "@/lib/buildlog";

export const revalidate = 3600;

export default async function HomePage() {
  const log = await getBuildLog();
  return (
    <>
      <Hero />
      <Proof />
      <ScoreboardTeaser log={log} />
      <About />
      <Video />
      <Career />
      <Press />
      <CTA />
    </>
  );
}
