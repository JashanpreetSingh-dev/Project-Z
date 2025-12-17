"use client";

import Link from "next/link";
import { ArrowRight, Play, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  GradientTextReveal,
  GradientBackground,
  FloatingElement,
  BlurReveal,
  EnhancedTextReveal,
  MeshGradient,
  AnimatedButton,
  ScrollProgress,
} from "@/components/animations";

export function HeroSection() {
  return (
    <>
      <ScrollProgress />
      <GradientBackground variant="hero">
        <MeshGradient variant="hero" animated>
          <section className="relative">
        {/* Floating decorative elements */}
        <FloatingElement
          className="absolute top-20 left-[10%] hidden lg:block"
          delay={0}
          duration={6}
          amplitude={20}
        >
          <div className="w-24 h-24 rounded-full bg-primary/10 blur-2xl" />
        </FloatingElement>
        
        <FloatingElement
          className="absolute bottom-32 right-[15%] hidden lg:block"
          delay={2}
          duration={5}
          amplitude={15}
          direction="diagonal"
        >
          <div className="w-32 h-32 rounded-full bg-primary/8 blur-2xl" />
        </FloatingElement>

        <FloatingElement
          className="absolute top-1/2 left-[5%] hidden xl:block"
          delay={4}
          duration={7}
          amplitude={12}
        >
          <div className="w-16 h-16 rounded-full bg-primary/5 blur-xl" />
        </FloatingElement>

        <div className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <BlurReveal delay={0} direction="none">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
                <Wrench className="h-3.5 w-3.5" />
                Built for Auto Repair Shops
              </div>
            </BlurReveal>

            {/* Headline - Enhanced text reveal with React Bits */}
            <h1 className="heading-display">
              <EnhancedTextReveal 
                text="Never Miss a" 
                delay={0.1} 
                variant="word"
                staggerDelay={0.05}
              />
              {" "}
              <GradientTextReveal delay={0.4}>
                Customer Call
              </GradientTextReveal>
              {" "}
              <EnhancedTextReveal 
                text="Again" 
                delay={0.6} 
                variant="word"
                staggerDelay={0.05}
              />
            </h1>

            {/* Subheadline */}
            <BlurReveal delay={0.5} blurAmount={6}>
              <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
                Akseli is a voice AI receptionist that handles repair status checks, business hours,
                and customer questions—24/7, while you focus on fixing cars.
              </p>
            </BlurReveal>

            {/* CTA Buttons with enhanced React Bits animations */}
            <BlurReveal delay={0.6} direction="up">
              <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
                <AnimatedButton variant="glow" strength={0.15}>
                  <Button size="lg" className="btn-primary-glow h-14 px-8 text-base" asChild>
                    <Link href="/sign-up">
                      Get Started Free
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </AnimatedButton>
                
                <AnimatedButton variant="magnetic" strength={0.1}>
                  <Button size="lg" variant="ghost" className="h-14 px-6 text-base text-muted-foreground" asChild>
                    <Link href="/demo">
                      <Play className="mr-2 h-4 w-4" />
                      Watch Demo
                    </Link>
                  </Button>
                </AnimatedButton>
              </div>
            </BlurReveal>

            {/* Trust signals */}
            <BlurReveal delay={0.7} blurAmount={4}>
              <p className="mt-6 text-sm text-muted-foreground">
                No credit card required · Setup in 5 minutes · Cancel anytime
              </p>
            </BlurReveal>
          </div>
        </div>
      </section>
      </MeshGradient>
    </GradientBackground>
    </>
  );
}
