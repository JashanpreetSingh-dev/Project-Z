"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  strength?: number;
  radius?: number;
}

export function MagneticButton({
  children,
  className = "",
  strength = 0.3,
  radius = 150,
}: MagneticButtonProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  // Smooth spring animation
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    // Only apply effect within radius
    if (distance < radius) {
      const factor = 1 - distance / radius;
      x.set(distanceX * strength * factor);
      y.set(distanceY * strength * factor);
    } else {
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={`inline-block ${className}`}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {children}
    </motion.div>
  );
}

// Simpler hover scale effect for buttons
interface HoverScaleProps {
  children: ReactNode;
  className?: string;
  scale?: number;
}

export function HoverScale({
  children,
  className = "",
  scale = 1.02,
}: HoverScaleProps) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      whileHover={{ scale }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.div>
  );
}

// Button with glow effect on hover
interface GlowButtonWrapperProps {
  children: ReactNode;
  className?: string;
}

export function GlowButtonWrapper({
  children,
  className = "",
}: GlowButtonWrapperProps) {
  return (
    <motion.div
      className={`relative inline-block ${className}`}
      whileHover="hover"
      initial="initial"
    >
      {/* Glow layer */}
      <motion.div
        className="absolute inset-0 rounded-lg gradient-bg blur-xl"
        variants={{
          initial: { opacity: 0.3, scale: 0.95 },
          hover: { opacity: 0.5, scale: 1.05 },
        }}
        transition={{ duration: 0.3 }}
      />
      
      {/* Button content */}
      <motion.div
        className="relative"
        variants={{
          initial: { y: 0 },
          hover: { y: -1 },
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
