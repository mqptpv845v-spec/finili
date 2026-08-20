import type { Metadata } from "next";
import { Instrument_Sans } from "next/font/google";
import "./globals.css";

// Rule 8: 100% Instrument Sans, self-hosted through next/font (no render-blocking
// Google Fonts request, no layout shift).
const instrumentSans = Instrument_Sans({
  subsets: ["latin"],
  variable: "--font-instrument-sans",
});

export const metadata: Metadata = {
  title: "Briefd by Finali — review media-plan requirements",
  description: "Parse an .xlsx media plan into a traceable, correctable workspace backed by a provisional set of cited publisher specifications.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={instrumentSans.variable}>
      <body className="min-h-screen bg-light text-graphite antialiased selection:bg-yellow selection:text-graphite">
        {children}
      </body>
    </html>
  );
}
