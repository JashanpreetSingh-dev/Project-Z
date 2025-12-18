"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";

interface GradientTextRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function GradientTextReveal({
  children,
  className = "",
  delay = 0,
  once = true,
}: GradientTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  return (
    <motion.span
      ref={ref}
      className={`inline-block gradient-text ${className}`}
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={
        isInView
          ? { opacity: 1, y: 0, filter: "blur(0px)" }
          : { opacity: 0, y: 20, filter: "blur(4px)" }
      }
      transition={{
        duration: 0.6,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.span>
  );
}
