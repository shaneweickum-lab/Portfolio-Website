import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { RegisterServiceWorker } from "@/components/register-sw";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Narrate — Read Aloud",
  description:
    "Upload a manuscript and have it read aloud right in your browser, using your device's own voices. Works offline once installed.",
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0c0a09",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <RegisterServiceWorker />
        {children}
      </body>
    </html>
  );
}
