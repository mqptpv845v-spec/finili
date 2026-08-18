import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Finali - Automate your print & multi-format production",
  description: "Connect InDesign templates with your media plans. Generate dozens of print-ready, fully validated PDF/X files in seconds.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#F5F5F5] text-[#191A1C] antialiased selection:bg-[#FFFE7D] selection:text-[#191A1C]" style={{ fontFamily: "'Instrument Sans', sans-serif" }}>
        {children}
      </body>
    </html>
  );
}


