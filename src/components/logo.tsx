"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLLAPSE_THRESHOLD = 120;

const crossfade = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.25, ease: "easeIn" as const },
};

export function Logo() {
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setCollapsed(window.scrollY > COLLAPSE_THRESHOLD);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Link
      href="/"
      className="flex items-baseline font-mono text-sm font-semibold tracking-tight text-foreground"
    >
      <AnimatePresence mode="wait">
        {collapsed ? (
          <motion.span key="collapsed" className="inline-block" {...crossfade}>
            {"<N"}
            <span className="text-wonder">/</span>
            {"A>"}
          </motion.span>
        ) : (
          <motion.span key="expanded" className="inline-block" {...crossfade}>
            Nodylus Automat
            <span className="text-wonder">/</span>
            ons
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
