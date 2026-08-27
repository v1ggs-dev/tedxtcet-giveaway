import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TEDxTCET 2026 — Giveaway Lucky Draw",
  description: "Official Internal Giveaway Lucky Draw Machine for TEDxTCET 2026",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#08080A] text-white antialiased selection:bg-red-600 selection:text-white">
        {children}
      </body>
    </html>
  );
}
