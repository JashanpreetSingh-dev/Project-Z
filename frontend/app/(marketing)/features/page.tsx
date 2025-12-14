import Link from "next/link";
import { 
  ArrowRight, 
  Phone, 
  Clock, 
  Wrench, 
  Shield, 
  BarChart3, 
  Settings, 
  Zap, 
  MessageSquare,
  PhoneForwarded,
  FileText,
  Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BlurReveal,
  ScrollReveal,
  TextReveal,
  GradientTextReveal,
  MagneticButton,
} from "@/components/animations";

export const metadata = {
  title: "Features - Voice AI",
  description: "Explore all the features of Voice AI - your AI-powered phone receptionist for auto shops.",
};

const features = [
  {
    icon: Phone,
    title: "24/7 Availability",
    description: "Never sleeps, takes breaks, or calls in sick. Every call answered instantly, day or night.",
  },
  {
    icon: Wrench,
    title: "Repair Status Lookup",
    description: "AI looks up work orders by name, phone, or ticket ID and provides real-time updates.",
  },
  {
    icon: Clock,
    title: "Business Hours & Location",
    description: "Answers questions about hours, location, and directions—even when you're closed.",
  },
  {
    icon: PhoneForwarded,
    title: "Smart Call Transfers",
    description: "Transfers complex calls to your team with full context of the conversation.",
  },
  {
    icon: FileText,
    title: "Call Summaries",
    description: "Clean, structured summaries of every call. Intent, data accessed, and outcome.",
  },
  {
    icon: Lock,
    title: "Privacy-First",
    description: "No call recordings or transcripts. Just summaries, not surveillance.",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Call volumes, common questions, transfer rates, and satisfaction trends.",
  },
  {
    icon: Settings,
    title: "Easy Configuration",
    description: "Custom greetings, CSV upload, and shop management integrations.",
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <BlurReveal delay={0} direction="none">
            <p className="section-eyebrow">Features</p>
          </BlurReveal>
          <h1 className="heading-display">
            <TextReveal text="Everything you need to" delay={0.1} />
            {" "}
            <GradientTextReveal delay={0.4}>never miss a call</GradientTextReveal>
          </h1>
          <BlurReveal delay={0.5} blurAmount={6}>
            <p className="mt-4 text-lg text-muted-foreground">
              AI handles routine calls so you can focus on repairs.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t bg-muted/20 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-4 md:grid-cols-2 max-w-4xl mx-auto">
            {features.map((feature, index) => (
              <BlurReveal
                key={feature.title}
                delay={0.05 + index * 0.05}
                blurAmount={6}
              >
                <div className="card-feature h-full">
                  <div className="flex items-start gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <feature.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{feature.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">Why Voice AI</p>
              <h2 className="heading-section">Built different</h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <BlurReveal delay={0.1} blurAmount={6}>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Zap className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Tool-Based AI</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Uses structured tools to look up real data. Never guesses.
                </p>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2} blurAmount={6}>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Shield className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Privacy by Design</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  No recordings, no transcripts. Just clean summaries.
                </p>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.3} blurAmount={6}>
              <div className="text-center p-6">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <MessageSquare className="h-6 w-6" />
                </div>
                <h3 className="font-semibold">Graceful Fallbacks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Transfers to your team with context when unsure.
                </p>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20 py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="heading-section">Ready to see it in action?</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Try our interactive demo or start your free trial today.
            </p>
          </ScrollReveal>
          <BlurReveal delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <MagneticButton strength={0.15}>
                <Button size="lg" className="btn-primary-glow h-14 px-8 text-base" asChild>
                  <Link href="/sign-up">
                    Start Free Trial
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </MagneticButton>
              <MagneticButton strength={0.1}>
                <Button size="lg" variant="ghost" className="h-14 px-6 text-muted-foreground" asChild>
                  <Link href="/demo">Try the Demo</Link>
                </Button>
              </MagneticButton>
            </div>
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
