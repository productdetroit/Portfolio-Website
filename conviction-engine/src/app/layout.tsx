import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Conviction Engine",
  description:
    "Trace a defensible line from strategy to a validated, monetizable opportunity.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
