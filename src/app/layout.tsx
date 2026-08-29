import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import { SiteNav } from "@/components/site-nav";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://shaneweickum.dev"),
  title: {
    default: "Nodylus Automat/ons",
    template: "%s · Nodylus Automat/ons",
  },
  description:
    "Sustainable AI & automation consulting from Nodylus Automat/ons, founded by Shane Weickum — right-sized audits, deterministic automation, AI integration, and custom software for small businesses.",
  openGraph: {
    title: "Nodylus Automat/ons",
    description:
      "Sustainable AI & automation consulting from Nodylus Automat/ons, founded by Shane Weickum — right-sized audits, deterministic automation, AI integration, and custom software for small businesses.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`dark ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteNav />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
