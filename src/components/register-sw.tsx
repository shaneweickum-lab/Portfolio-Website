"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js", { scope: "/projects/" }).catch(() => {
        // Installability is a nice-to-have; ignore registration failures.
      });
    }
  }, []);

  return null;
}
