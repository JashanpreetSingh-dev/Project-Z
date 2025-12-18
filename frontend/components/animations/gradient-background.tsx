"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GradientOrbProps {
  className?: string;
  color?: "primary" | "accent" | "mixed";
  size?: "sm" | "md" | "lg" | "xl";
  duration?: number;
  delay?: number;
}

const sizeClasses = {
  sm: "w-64 h-64",
  md: "w-96 h-96",
  lg: "w-[32rem] h-[32rem]",
  xl: "w-[40rem] h-[40rem]",
};

const colorClasses = {
  primary: "bg-primary/10",
  accent: "bg-primary/8",
  mixed: "bg-primary/12",
};

function GradientOrb({
  className = "",
  color = "primary",
  size = "lg",
  duration = 20,
  delay = 0,
}: GradientOrbProps) {
  return (
    <motion.div
      className={`absolute rounded-full blur-3xl ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      animate={{
        x: [0, 30, -20, 10, 0],
        y: [0, -20, 30, -10, 0],
        scale: [1, 1.05, 0.95, 1.02, 1],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
      style={{ willChange: "transform" }}
    />
  );
}

interface GradientBackgroundProps {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "subtle" | "vibrant";
}

export function GradientBackground({
  children,
  className = "",
  variant = "hero",
}: GradientBackgroundProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Gradient orbs container */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        {variant === "hero" && (
          <>
            <GradientOrb
              color="primary"
              size="xl"
              className="-top-48 -right-48"
              duration={25}
              delay={0}
            />
            <GradientOrb
              color="accent"
              size="lg"
              className="-bottom-32 -left-32"
              duration={20}
              delay={2}
            />
            <GradientOrb
              color="mixed"
              size="md"
              className="top-1/3 left-1/4"
              duration={18}
              delay={4}
            />
          </>
        )}

        {variant === "subtle" && (
          <>
            <GradientOrb
              color="primary"
              size="lg"
              className="-top-64 right-1/4 opacity-50"
              duration={30}
              delay={0}
            />
            <GradientOrb
              color="accent"
              size="md"
              className="-bottom-48 left-1/3 opacity-50"
              duration={25}
              delay={3}
            />
          </>
        )}

        {variant === "vibrant" && (
          <>
            <GradientOrb
              color="primary"
              size="xl"
              className="-top-32 -right-32"
              duration={20}
              delay={0}
            />
            <GradientOrb
              color="accent"
              size="xl"
              className="-bottom-32 -left-32"
              duration={22}
              delay={1}
            />
            <GradientOrb
              color="mixed"
              size="lg"
              className="top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              duration={18}
              delay={2}
            />
          </>
        )}

        {/* Subtle noise overlay for texture */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      {children}
    </div>
  );
}

