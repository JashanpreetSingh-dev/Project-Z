"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useRef } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface ScrollProgressProps {
  className?: string;
  color?: string;
  height?: string;
}

export function ScrollProgress({
  className = "",
  color = "hsl(var(--primary))",
  height = "2px",
}: ScrollProgressProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  if (prefersReducedMotion) {
    return null;
  }

  return (
    <div
      ref={containerRef}
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
    >
      <motion.div
        style={{
          scaleX,
          transformOrigin: "left",
          height,
          backgroundColor: color,
        }}
        className="w-full"
      />
    </div>
  );
}

