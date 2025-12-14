"use client";

import { motion, useScroll, useTransform, MotionValue } from "framer-motion";
import { useRef, ReactNode } from "react";

interface ParallaxSectionProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "up" | "down";
}

export function ParallaxSection({
  children,
  className = "",
  speed = 0.1,
  direction = "up",
}: ParallaxSectionProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "up" ? -1 : 1;
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${multiplier * speed * -100}px`, `${multiplier * speed * 100}px`]
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ y }}>
        {children}
      </motion.div>
    </div>
  );
}

// Parallax container that affects all children with depth layers
interface ParallaxContainerProps {
  children: ReactNode;
  className?: string;
}

export function ParallaxContainer({
  children,
  className = "",
}: ParallaxContainerProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  return (
    <div ref={ref} className={`relative ${className}`}>
      <ParallaxContext.Provider value={{ scrollYProgress }}>
        {children}
      </ParallaxContext.Provider>
    </div>
  );
}

// Context for parallax
import { createContext, useContext } from "react";

const ParallaxContext = createContext<{
  scrollYProgress: MotionValue<number>;
} | null>(null);

interface ParallaxLayerProps {
  children: ReactNode;
  className?: string;
  speed?: number;
}

export function ParallaxLayer({
  children,
  className = "",
  speed = 0.1,
}: ParallaxLayerProps) {
  const context = useContext(ParallaxContext);
  
  // Fallback ref if used outside container
  const fallbackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: fallbackProgress } = useScroll({
    target: fallbackRef,
    offset: ["start end", "end start"],
  });

  const scrollYProgress = context?.scrollYProgress || fallbackProgress;
  
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${speed * -50}px`, `${speed * 50}px`]
  );

  return (
    <motion.div
      ref={context ? undefined : fallbackRef}
      className={className}
      style={{ y }}
    >
      {children}
    </motion.div>
  );
}

// Simple parallax for background elements
interface ParallaxBackgroundProps {
  children: ReactNode;
  className?: string;
  offset?: number;
}

export function ParallaxBackground({
  children,
  className = "",
  offset = 50,
}: ParallaxBackgroundProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [-offset, offset]);
  const opacity = useTransform(scrollYProgress, [0, 0.3, 0.7, 1], [0, 1, 1, 0]);

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 -z-10"
        style={{ y, opacity }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// Horizontal parallax for decorative elements
interface HorizontalParallaxProps {
  children: ReactNode;
  className?: string;
  speed?: number;
  direction?: "left" | "right";
}

export function HorizontalParallax({
  children,
  className = "",
  speed = 0.1,
  direction = "left",
}: HorizontalParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const multiplier = direction === "left" ? -1 : 1;
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    [`${multiplier * speed * -100}px`, `${multiplier * speed * 100}px`]
  );

  return (
    <div ref={ref} className={`relative ${className}`}>
      <motion.div style={{ x }}>
        {children}
      </motion.div>
    </div>
  );
}
