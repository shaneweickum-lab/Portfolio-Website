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
    default: "Shane Weickum",
    template: "%s · Shane Weickum",
  },
  description:
    "Shane Weickum is an AI systems engineer specializing in deterministic engineering, small neural networks, and small language models — orchestrating the smallest capability that reliably solves each task instead of defaulting to one large general-purpose model. Also runs Nodylus Automat/ons, a sustainable AI & automation consultancy.",
  openGraph: {
    title: "Shane Weickum",
    description:
      "AI systems engineer specializing in deterministic engineering, small neural networks, and small language models — orchestrating the smallest capability that reliably solves each task.",
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
