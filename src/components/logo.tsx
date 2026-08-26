"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLLAPSE_THRESHOLD = 120;

const fadeSlide = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: 0.25, ease: "easeIn" as const },
};

const dotBounce = {
  initial: { opacity: 0 },
  animate: { opacity: 1, x: 0, y: 0 },
  exit: {
    x: [0, -10, -22, -42, -72],
    y: [0, -6, 0, -4, 0],
    opacity: [1, 1, 1, 0.6, 0],
  },
  transition: {
    duration: 0.55,
    times: [0, 0.2, 0.4, 0.7, 1],
    ease: "easeOut" as const,
  },
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
      <motion.span layout="position" className="inline-block">
        W
      </motion.span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span
            key="dot"
            layout="position"
            className="inline-block text-wonder"
            {...dotBounce}
          >
            .
          </motion.span>
        )}
      </AnimatePresence>
      <motion.span layout="position" className="inline-block">
        P
      </motion.span>
      <AnimatePresence>
        {!collapsed && (
          <motion.span key="solutions" layout="position" className="inline-block" {...fadeSlide}>
            . Solutions
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  );
}
