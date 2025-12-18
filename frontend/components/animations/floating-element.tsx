"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface FloatingElementProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  amplitude?: number;
  direction?: "vertical" | "horizontal" | "diagonal";
}

export function FloatingElement({
  children,
  className = "",
  delay = 0,
  duration = 5,
  amplitude = 15,
  direction = "vertical",
}: FloatingElementProps) {
  const getAnimation = () => {
    switch (direction) {
      case "vertical":
        return {
          y: [0, -amplitude, 0, amplitude, 0],
        };
      case "horizontal":
        return {
          x: [0, amplitude, 0, -amplitude, 0],
        };
      case "diagonal":
        return {
          x: [0, amplitude * 0.7, 0, -amplitude * 0.7, 0],
          y: [0, -amplitude * 0.7, 0, amplitude * 0.7, 0],
        };
      default:
        return {
          y: [0, -amplitude, 0, amplitude, 0],
        };
    }
  };

  return (
    <motion.div
      className={className}
      animate={getAnimation()}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

