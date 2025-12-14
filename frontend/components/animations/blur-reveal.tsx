"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";

interface BlurRevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  blurAmount?: number;
  once?: boolean;
  direction?: "up" | "down" | "left" | "right" | "none";
}

export function BlurReveal({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  blurAmount = 8,
  once = true,
  direction = "up",
}: BlurRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.3 });

  const getTranslate = () => {
    const distance = 20;
    switch (direction) {
      case "up":
        return { y: distance };
      case "down":
        return { y: -distance };
      case "left":
        return { x: distance };
      case "right":
        return { x: -distance };
      case "none":
      default:
        return {};
    }
  };

  const initialTranslate = getTranslate();

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        filter: `blur(${blurAmount}px)`,
        ...initialTranslate,
      }}
      animate={
        isInView
          ? {
              opacity: 1,
              filter: "blur(0px)",
              x: 0,
              y: 0,
            }
          : {
              opacity: 0,
              filter: `blur(${blurAmount}px)`,
              ...initialTranslate,
            }
      }
      transition={{
        duration,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Stagger children with blur reveal
interface BlurStaggerContainerProps {
  children: ReactNode;
  className?: string;
  staggerDelay?: number;
  once?: boolean;
}

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    filter: "blur(8px)",
    y: 20,
  },
  visible: {
    opacity: 1,
    filter: "blur(0px)",
    y: 0,
  },
};

export function BlurStaggerContainer({
  children,
  className = "",
  staggerDelay = 0.1,
  once = true,
}: BlurStaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.2 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: staggerDelay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function BlurStaggerItem({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      variants={itemVariants}
      transition={{
        duration: 0.5,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}

// Fade blur for images/cards
interface FadeBlurProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  once?: boolean;
}

export function FadeBlur({
  children,
  className = "",
  delay = 0,
  once = true,
}: FadeBlurProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, filter: "blur(0px)" }
          : { opacity: 0, scale: 0.95, filter: "blur(10px)" }
      }
      transition={{
        duration: 0.7,
        delay,
        ease: [0.25, 0.1, 0.25, 1],
      }}
    >
      {children}
    </motion.div>
  );
}
