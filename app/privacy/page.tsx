import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { legal } from "@/content/legal";

export const metadata: Metadata = {
  title: `${legal.privacy.title} — Product Detroit`,
  robots: { index: false },
};

export default function Page() {
  return <LegalPage doc={legal.privacy} />;
}
