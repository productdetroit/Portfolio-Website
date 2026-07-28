"use client";

import { site } from "@/content/site";

/** Résumé download link — fires a GA4 event so downloads are trackable
 *  now that the PDF is served from the domain (spec §6.5). */
export default function ResumeLink({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={site.links.resume}
      target="_blank"
      rel="noopener noreferrer"
      className={className}
      onClick={() => {
        (
          window as unknown as { gtag?: (...args: unknown[]) => void }
        ).gtag?.("event", "resume_download", {
          file_name: "joe-ross-resume.pdf",
        });
      }}
    >
      {children}
    </a>
  );
}
