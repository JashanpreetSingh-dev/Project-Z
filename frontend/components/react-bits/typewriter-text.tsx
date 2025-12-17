"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useEffect, useState } from "react";

interface TypewriterTextProps {
  text: string;
  className?: string;
  speed?: number;
  delay?: number;
  once?: boolean;
  showCursor?: boolean;
  onComplete?: () => void;
}

export function TypewriterText({
  text,
  className = "",
  speed = 50,
  delay = 0,
  once = true,
  showCursor = true,
  onComplete,
}: TypewriterTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once, amount: 0.5 });
  const [displayedText, setDisplayedText] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (!isInView) return;

    const timeout = setTimeout(() => {
      setIsTyping(true);
      let currentIndex = 0;

      const typeInterval = setInterval(() => {
        if (currentIndex < text.length) {
          setDisplayedText(text.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);
          if (onComplete) {
            onComplete();
          }
        }
      }, speed);

      return () => clearInterval(typeInterval);
    }, delay * 1000);

    return () => clearTimeout(timeout);
  }, [isInView, text, speed, delay, onComplete]);

  return (
    <span ref={ref} className={className}>
      {displayedText}
      {showCursor && isTyping && (
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="inline-block w-0.5 h-[1em] bg-current ml-1 align-middle"
        />
      )}
    </span>
  );
}

