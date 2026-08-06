import type { Metadata } from "next";
import type { ReactNode } from "react";
import { RegisterServiceWorker } from "@/components/register-sw";

export const metadata: Metadata = {
  manifest: "/manifest.json",
};

export const viewport = {
  themeColor: "#0a0a0c",
};

export default function ProjectsLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <RegisterServiceWorker />
      {children}
    </>
  );
}
