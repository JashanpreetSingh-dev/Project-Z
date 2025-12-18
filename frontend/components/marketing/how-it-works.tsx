"use client";

import { Phone, Brain, MessageCircle } from "lucide-react";
import { ScrollReveal, AnimatedCard, EnhancedTextReveal, StaggerGrid } from "@/components/animations";

const steps = [
  {
    icon: Phone,
    title: "Customer",
    titleHighlight: "calls",
    description: "They dial your shop's AI phone number with a question.",
  },
  {
    icon: Brain,
    title: "AI",
    titleHighlight: "understands",
    description: "Instantly identifies intent—status check, hours, or complex request.",
  },
  {
    icon: MessageCircle,
    title: "Responds or",
    titleHighlight: "transfers",
    description: "Answers from your data or transfers to your team with context.",
  },
];

export function HowItWorksSection() {
  return (
    <section className="py-24 lg:py-32">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-16">
            <p className="section-eyebrow">How it works</p>
            <h2 className="heading-section">
              <EnhancedTextReveal 
                text="Simple, seamless, automatic" 
                variant="word"
                staggerDelay={0.05}
              />
            </h2>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="mx-auto max-w-4xl">
          <StaggerGrid className="grid gap-8 md:grid-cols-3" staggerDelay={0.15}>
            {steps.map((step, index) => (
              <AnimatedCard key={step.title} hoverScale={1.03} tiltIntensity={8} delay={index * 0.1}>
                <div className="relative text-center">
                  {/* Icon */}
                  <div className="mx-auto mb-5">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">
                    {step.title} <span className="gradient-text">{step.titleHighlight}</span>
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>

                  {/* Connector line (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-gradient-to-r from-primary/40 via-primary/20 to-primary/40" />
                  )}
                </div>
              </AnimatedCard>
            ))}
          </StaggerGrid>
        </div>
      </div>
    </section>
  );
}
