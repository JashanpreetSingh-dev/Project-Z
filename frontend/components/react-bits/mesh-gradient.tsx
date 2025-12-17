"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface MeshGradientProps {
  children: ReactNode;
  className?: string;
  variant?: "hero" | "subtle" | "vibrant";
  animated?: boolean;
}

export function MeshGradient({
  children,
  className = "",
  variant = "hero",
  animated = true,
}: MeshGradientProps) {
  const gradientConfig = {
    hero: {
      colors: [
        "hsl(var(--primary) / 0.15)",
        "hsl(var(--gradient-to) / 0.12)",
        "hsl(var(--primary) / 0.08)",
      ],
      positions: [
        { x: "0%", y: "0%" },
        { x: "100%", y: "100%" },
        { x: "50%", y: "50%" },
      ],
    },
    subtle: {
      colors: [
        "hsl(var(--primary) / 0.08)",
        "hsl(var(--muted) / 0.05)",
        "hsl(var(--primary) / 0.03)",
      ],
      positions: [
        { x: "20%", y: "20%" },
        { x: "80%", y: "80%" },
        { x: "50%", y: "50%" },
      ],
    },
    vibrant: {
      colors: [
        "hsl(var(--primary) / 0.2)",
        "hsl(var(--gradient-to) / 0.18)",
        "hsl(var(--primary) / 0.15)",
        "hsl(var(--gradient-to) / 0.12)",
      ],
      positions: [
        { x: "0%", y: "0%" },
        { x: "100%", y: "0%" },
        { x: "0%", y: "100%" },
        { x: "100%", y: "100%" },
      ],
    },
  };

  const config = gradientConfig[variant];

  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div className="absolute inset-0 -z-10">
        {animated ? (
          <motion.div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${config.positions[0].x} ${config.positions[0].y}, ${config.colors[0]}, transparent 50%)`,
            }}
            animate={{
              background: [
                `radial-gradient(circle at ${config.positions[0].x} ${config.positions[0].y}, ${config.colors[0]}, transparent 50%)`,
                `radial-gradient(circle at ${config.positions[1].x} ${config.positions[1].y}, ${config.colors[1]}, transparent 50%)`,
                `radial-gradient(circle at ${config.positions[0].x} ${config.positions[0].y}, ${config.colors[0]}, transparent 50%)`,
              ],
            }}
            transition={{
              duration: 20,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `radial-gradient(circle at ${config.positions[0].x} ${config.positions[0].y}, ${config.colors[0]}, transparent 50%)`,
            }}
          />
        )}
        {config.positions.slice(1).map((pos, index) => (
          animated ? (
            <motion.div
              key={index}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${pos.x} ${pos.y}, ${config.colors[index + 1]}, transparent 50%)`,
              }}
              animate={{
                background: [
                  `radial-gradient(circle at ${pos.x} ${pos.y}, ${config.colors[index + 1]}, transparent 50%)`,
                  `radial-gradient(circle at ${config.positions[index].x} ${config.positions[index].y}, ${config.colors[index]}, transparent 50%)`,
                  `radial-gradient(circle at ${pos.x} ${pos.y}, ${config.colors[index + 1]}, transparent 50%)`,
                ],
              }}
              transition={{
                duration: 15 + index * 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: index * 2,
              }}
            />
          ) : (
            <div
              key={index}
              className="absolute inset-0"
              style={{
                background: `radial-gradient(circle at ${pos.x} ${pos.y}, ${config.colors[index + 1]}, transparent 50%)`,
              }}
            />
          )
        ))}
      </div>
      {children}
    </div>
  );
}

