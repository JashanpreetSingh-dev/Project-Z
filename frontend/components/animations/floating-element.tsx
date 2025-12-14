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

// Rotating floating element
interface RotatingFloatProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
}

export function RotatingFloat({
  children,
  className = "",
  duration = 20,
  delay = 0,
}: RotatingFloatProps) {
  return (
    <motion.div
      className={className}
      animate={{
        rotate: [0, 360],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "linear",
      }}
      style={{ willChange: "transform" }}
    >
      {children}
    </motion.div>
  );
}

// Pulsing element
interface PulseElementProps {
  children: ReactNode;
  className?: string;
  duration?: number;
  delay?: number;
  scale?: number;
}

export function PulseElement({
  children,
  className = "",
  duration = 3,
  delay = 0,
  scale = 1.05,
}: PulseElementProps) {
  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, scale, 1],
        opacity: [0.8, 1, 0.8],
      }}
      transition={{
        duration,
        delay,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
}

// Decorative floating shapes for backgrounds
interface FloatingShapesProps {
  className?: string;
  count?: number;
}

export function FloatingShapes({ className = "", count = 3 }: FloatingShapesProps) {
  const shapes = Array.from({ length: count }, (_, i) => ({
    id: i,
    size: 80 + Math.random() * 120,
    x: Math.random() * 100,
    y: Math.random() * 100,
    delay: Math.random() * 5,
    duration: 4 + Math.random() * 4,
    amplitude: 10 + Math.random() * 15,
  }));

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {shapes.map((shape) => (
        <FloatingElement
          key={shape.id}
          delay={shape.delay}
          duration={shape.duration}
          amplitude={shape.amplitude}
          className="absolute"
          direction={shape.id % 2 === 0 ? "vertical" : "diagonal"}
        >
          <div
            className="rounded-full bg-primary/5 blur-2xl"
            style={{
              width: shape.size,
              height: shape.size,
              left: `${shape.x}%`,
              top: `${shape.y}%`,
            }}
          />
        </FloatingElement>
      ))}
    </div>
  );
}
