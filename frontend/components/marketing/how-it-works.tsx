"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const steps = [
  {
    number: 1,
    title: "Customer Calls",
    description:
      "A customer calls your shop's dedicated AI phone number with a question about their repair.",
  },
  {
    number: 2,
    title: "AI Understands",
    description:
      "Our AI instantly understands what they need—status check, hours, services, or to speak with someone.",
  },
  {
    number: 3,
    title: "Instant Response",
    description:
      "The AI provides accurate info from your shop data or seamlessly transfers complex calls to your team.",
  },
];

interface StepCircleProps {
  number: number;
  progress: number;
}

function StepCircle({ number, progress }: StepCircleProps) {
  // Calculate if this step should be filled based on progress
  const stepThreshold = (number - 1) / steps.length;
  const isFilled = progress >= stepThreshold;
  const fillProgress = Math.min(
    1,
    Math.max(0, (progress - stepThreshold) * steps.length)
  );

  return (
    <div className="relative mx-auto mb-6 h-16 w-16">
      {/* Background circle */}
      <div className="absolute inset-0 rounded-2xl bg-muted/50" />

      {/* Filled overlay */}
      <motion.div
        className="absolute inset-0 rounded-2xl gradient-bg"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: isFilled ? 1 : 0,
          scale: isFilled ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      />

      {/* Inner glow effect when active */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ boxShadow: "0 0 0 0 rgba(139, 92, 246, 0)" }}
        animate={{
          boxShadow: isFilled
            ? "0 0 30px -5px rgba(139, 92, 246, 0.5)"
            : "0 0 0 0 rgba(139, 92, 246, 0)",
        }}
        transition={{ duration: 0.5 }}
      />

      {/* Number */}
      <motion.span
        className="absolute inset-0 flex items-center justify-center text-2xl font-bold"
        animate={{
          color: isFilled ? "white" : "hsl(var(--muted-foreground))",
        }}
        transition={{ duration: 0.3 }}
      >
        {number}
      </motion.span>
    </div>
  );
}

interface ConnectorLineProps {
  progress: number;
  stepIndex: number;
}

function ConnectorLine({ progress, stepIndex }: ConnectorLineProps) {
  // Calculate fill for this connector based on progress between its two steps
  const startThreshold = stepIndex / steps.length;
  const endThreshold = (stepIndex + 1) / steps.length;
  const lineProgress = Math.min(
    1,
    Math.max(0, (progress - startThreshold) / (endThreshold - startThreshold))
  );

  return (
    <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-0.5 overflow-hidden">
      {/* Background line */}
      <div className="absolute inset-0 bg-border" />

      {/* Animated fill */}
      <motion.div
        className="absolute inset-y-0 left-0 gradient-bg"
        initial={{ width: "0%" }}
        animate={{ width: `${lineProgress * 100}%` }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

export function HowItWorksSection() {
  const containerRef = useRef<HTMLElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 0.8", "end 0.4"],
  });

  // Transform scroll progress to usable value
  const progress = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section ref={containerRef} className="py-24 relative">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <motion.div
          className="mx-auto max-w-2xl text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.5 }}
          transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <h2 className="text-3xl font-bold sm:text-4xl">How It Works</h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Get your AI receptionist up and running in three simple steps
          </p>
        </motion.div>

        {/* Progress indicator - vertical bar on left (desktop only) */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 h-48">
          <div className="relative w-1 h-full rounded-full bg-muted overflow-hidden">
            <motion.div
              className="absolute top-0 left-0 w-full gradient-bg rounded-full"
              style={{ height: useTransform(progress, [0, 1], ["0%", "100%"]) }}
            />
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{
                duration: 0.5,
                delay: index * 0.15,
                ease: [0.25, 0.1, 0.25, 1],
              }}
            >
              {/* Animated Step Circle */}
              <StepCircleWrapper stepNumber={step.number} scrollProgress={progress} />

              <motion.h3
                className="text-xl font-semibold mb-3"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.2 }}
              >
                {step.title}
              </motion.h3>

              <motion.p
                className="text-muted-foreground"
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 + 0.3 }}
              >
                {step.description}
              </motion.p>

              {/* Connector line - only for steps 1 and 2 */}
              {index < steps.length - 1 && (
                <ConnectorLineWrapper stepIndex={index} scrollProgress={progress} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

// Wrapper components to use motion values
function StepCircleWrapper({
  stepNumber,
  scrollProgress,
}: {
  stepNumber: number;
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
  const progressValue = useTransform(scrollProgress, (v) => v);

  return (
    <motion.div>
      <StepCircleInner stepNumber={stepNumber} progressMotion={progressValue} />
    </motion.div>
  );
}

function StepCircleInner({
  stepNumber,
  progressMotion,
}: {
  stepNumber: number;
  progressMotion: ReturnType<typeof useTransform<number, number>>;
}) {
  // Subscribe to motion value
  const progress = useMotionValueState(progressMotion);

  return <StepCircle number={stepNumber} progress={progress} />;
}

function ConnectorLineWrapper({
  stepIndex,
  scrollProgress,
}: {
  stepIndex: number;
  scrollProgress: ReturnType<typeof useTransform<number, number>>;
}) {
  const progressValue = useTransform(scrollProgress, (v) => v);

  return (
    <motion.div>
      <ConnectorLineInner stepIndex={stepIndex} progressMotion={progressValue} />
    </motion.div>
  );
}

function ConnectorLineInner({
  stepIndex,
  progressMotion,
}: {
  stepIndex: number;
  progressMotion: ReturnType<typeof useTransform<number, number>>;
}) {
  const progress = useMotionValueState(progressMotion);

  return <ConnectorLine progress={progress} stepIndex={stepIndex} />;
}

// Custom hook to get current value from motion value
import { useState, useEffect } from "react";
import type { MotionValue } from "framer-motion";

function useMotionValueState(motionValue: MotionValue<number>): number {
  const [value, setValue] = useState(motionValue.get());

  useEffect(() => {
    return motionValue.on("change", (v) => setValue(v));
  }, [motionValue]);

  return value;
}
