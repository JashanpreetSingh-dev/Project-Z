"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef, ReactNode } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface EnhancedTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  staggerDelay?: number;
  once?: boolean;
  variant?: "word" | "char" | "line";
  direction?: "up" | "down" | "left" | "right";
}

const wordVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
    filter: "blur(8px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
  },
};

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.8,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const lineVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
    clipPath: "inset(0 0 100% 0)",
  },
  visible: {
    opacity: 1,
    y: 0,
    clipPath: "inset(0 0 0% 0)",
  },
};

export function EnhancedTextReveal({
  text,
  className = "",
  delay = 0,
  staggerDelay = 0.05,
  once = true,
  variant = "word",
  direction = "up",
}: EnhancedTextRevealProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const prefersReducedMotion = useReducedMotion();

  const getVariants = () => {
    switch (variant) {
      case "char":
        return charVariants;
      case "line":
        return lineVariants;
      default:
        return wordVariants;
    }
  };

  const getDirectionOffset = () => {
    switch (direction) {
      case "down":
        return { y: -30 };
      case "left":
        return { x: 30 };
      case "right":
        return { x: -30 };
      default:
        return { y: 30 };
    }
  };

  if (variant === "char") {
    const characters = text.split("");
    const variants = getVariants();
    
    if (prefersReducedMotion) {
      return <span ref={ref} className={className}>{text}</span>;
    }
    
    return (
      <motion.span
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
      >
        {characters.map((char, index) => (
          <motion.span
            key={index}
            className="inline-block"
            variants={variants}
            transition={{
              duration: 0.4,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {char === " " ? "\u00A0" : char}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  if (variant === "line") {
    const lines = text.split("\n");
    const variants = getVariants();
    
    if (prefersReducedMotion) {
      return <span ref={ref} className={className}>{text}</span>;
    }
    
    return (
      <motion.span
        ref={ref}
        className={className}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
      >
        {lines.map((line, index) => (
          <motion.span
            key={index}
            className="block"
            variants={variants}
            transition={{
              duration: 0.6,
              ease: [0.25, 0.1, 0.25, 1],
            }}
          >
            {line}
            {index < lines.length - 1 && <br />}
          </motion.span>
        ))}
      </motion.span>
    );
  }

  // Word variant (default)
  const words = text.split(" ");
  const variants = getVariants();
  
  if (prefersReducedMotion) {
    return <span ref={ref} className={className}>{text}</span>;
  }
  
  return (
    <motion.span
      ref={ref}
      className={className}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      transition={{ staggerChildren: staggerDelay, delayChildren: delay }}
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="inline-block mr-2"
          variants={variants}
          transition={{
            duration: 0.5,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {word}
        </motion.span>
      ))}
    </motion.span>
  );
}

