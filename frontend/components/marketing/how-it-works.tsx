"use client";

import { Phone, Brain, MessageCircle } from "lucide-react";
import { ScrollReveal } from "@/components/animations";

const steps = [
  {
    number: 1,
    icon: Phone,
    title: "Customer calls",
    description: "They dial your shop's AI phone number with a question.",
  },
  {
    number: 2,
    icon: Brain,
    title: "AI understands",
    description: "Instantly identifies intent—status check, hours, or complex request.",
  },
  {
    number: 3,
    icon: MessageCircle,
    title: "Responds or transfers",
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
            <h2 className="heading-section">Simple, seamless, automatic</h2>
          </div>
        </ScrollReveal>

        {/* Steps */}
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 md:grid-cols-3">
            {steps.map((step, index) => (
              <ScrollReveal key={step.number} delay={index * 0.1}>
                <div className="relative text-center">
                  {/* Step number + icon */}
                  <div className="mx-auto mb-5 relative">
                    <div className="flex h-14 w-14 mx-auto items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <step.icon className="h-6 w-6" />
                    </div>
                    <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-background text-xs font-semibold">
                      {step.number}
                    </span>
                  </div>

                  <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.description}</p>

                  {/* Connector line (desktop only) */}
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-7 left-[calc(50%+2rem)] w-[calc(100%-4rem)] h-px bg-border" />
                  )}
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
