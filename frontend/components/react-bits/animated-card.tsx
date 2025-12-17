"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";
import { useReducedMotion } from "@/hooks/use-reduced-motion";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverScale?: number;
  tiltIntensity?: number;
  glowOnHover?: boolean;
  delay?: number;
}

export function AnimatedCard({
  children,
  className = "",
  hoverScale = 1.02,
  tiltIntensity = 15,
  glowOnHover = true,
  delay = 0,
}: AnimatedCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = useReducedMotion();
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 25, stiffness: 200 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [tiltIntensity, -tiltIntensity]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], prefersReducedMotion ? [0, 0] : [-tiltIntensity, tiltIntensity]), springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!ref.current || prefersReducedMotion) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const distanceX = (e.clientX - centerX) / rect.width;
    const distanceY = (e.clientY - centerY) / rect.height;
    
    x.set(distanceX);
    y.set(distanceY);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
      transition={prefersReducedMotion ? {} : { delay, duration: 0.5 }}
      whileHover={prefersReducedMotion ? {} : {
        scale: hoverScale,
        transition: { duration: 0.2 },
      }}
    >
      {glowOnHover && (
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 pointer-events-none"
          style={{
            background: "radial-gradient(circle at center, hsl(var(--primary) / 0.1), transparent 70%)",
          }}
          whileHover={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        />
      )}
      <div className="relative z-10">{children}</div>
    </motion.div>
  );
}

