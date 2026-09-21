import type { Metadata } from "next";

/** Private space: never indexed, never in the nav. Invitees arrive by link. */
export const metadata: Metadata = {
  title: "Demos",
  robots: { index: false, follow: false, nocache: true },
};

export default function DemosLayout({ children }: { children: React.ReactNode }) {
  return <div className="demos">{children}</div>;
}
