import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { site } from "@/config/site";
import "@/styles/globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jbmono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jbmono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: `${site.name} — Biblioteca 3D Industrial | Volume 01`,
  description: site.description,
  openGraph: {
    title: `${site.name} — Biblioteca 3D Industrial | Volume 01`,
    description: site.description,
    siteName: site.name,
    locale: "pt_BR",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jbmono.variable}`}>
      <body className="bg-background font-sans antialiased">{children}</body>
    </html>
  );
}
