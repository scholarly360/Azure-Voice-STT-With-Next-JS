import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Azure Voice STT",
  description: "Speech-to-Text powered by Azure VoiceLive API",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased">{children}</body>
    </html>
  );
}
