"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { ReactNode, useRef, MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface AnimatedButtonProps {
  children: ReactNode;
  className?: string;
  variant?: "magnetic" | "glow" | "ripple" | "scale";
  strength?: number;
  onClick?: () => void;
  disabled?: boolean;
}

export function AnimatedButton({
  children,
  className = "",
  variant = "magnetic",
  strength = 0.3,
  onClick,
  disabled = false,
}: AnimatedButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: MouseEvent<HTMLButtonElement>) => {
    if (!ref.current || disabled) return;

    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const distanceX = e.clientX - centerX;
    const distanceY = e.clientY - centerY;
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < 150) {
      const factor = 1 - distance / 150;
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

  if (variant === "glow") {
    return (
      <motion.button
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={onClick}
        disabled={disabled}
        whileHover="hover"
        whileTap="tap"
        initial="initial"
      >
        <motion.div
          className="absolute inset-0 rounded-lg gradient-bg blur-xl opacity-0"
          variants={{
            initial: { opacity: 0.3, scale: 0.95 },
            hover: { opacity: 0.6, scale: 1.05 },
            tap: { scale: 0.98 },
          }}
          transition={{ duration: 0.3 }}
        />
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }

  if (variant === "ripple") {
    return (
      <motion.button
        ref={ref}
        className={cn("relative overflow-hidden", className)}
        onClick={onClick}
        disabled={disabled}
        whileTap={{ scale: 0.95 }}
      >
        <span className="relative z-10">{children}</span>
      </motion.button>
    );
  }

  if (variant === "scale") {
    return (
      <motion.button
        ref={ref}
        className={className}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        {children}
      </motion.button>
    );
  }

  // Magnetic variant (default)
  return (
    <motion.button
      ref={ref}
      className={className}
      onClick={onClick}
      disabled={disabled}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}

