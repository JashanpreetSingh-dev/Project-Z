import Link from "next/link";
import { ArrowRight, Check, Search, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/demo/audio-player";
import {
  BlurReveal,
  ScrollReveal,
  TextReveal,
  GradientTextReveal,
  MagneticButton,
  FadeBlur,
} from "@/components/animations";

export default function DemoPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <BlurReveal delay={0} direction="none">
            <p className="section-eyebrow">Demo</p>
          </BlurReveal>
          <h1 className="heading-display">
            <TextReveal text="Experience" delay={0.1} />
            {" "}
            <GradientTextReveal delay={0.3}>Voice AI</GradientTextReveal>
          </h1>
          <BlurReveal delay={0.4} blurAmount={6}>
            <p className="mt-4 text-lg text-muted-foreground">
              Listen to how our AI receptionist handles real calls.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Demo Section */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <FadeBlur delay={0.3}>
            <div className="max-w-4xl mx-auto">
              <AudioPlayer />
            </div>
          </FadeBlur>
        </div>
      </section>

      {/* What You're Seeing */}
      <section className="border-t bg-muted/20 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">About this demo</p>
              <h2 className="heading-section">What you&apos;re hearing</h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
            <BlurReveal delay={0.1} blurAmount={6}>
              <div className="card-feature text-center h-full">
                <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Check className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Real Scenarios</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Actual calls our AI handles daily.
                </p>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.2} blurAmount={6}>
              <div className="card-feature text-center h-full">
                <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Search className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Data Lookups</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI accesses real shop data for accuracy.
                </p>
              </div>
            </BlurReveal>

            <BlurReveal delay={0.3} blurAmount={6}>
              <div className="card-feature text-center h-full">
                <div className="mx-auto mb-4 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <RefreshCw className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold">Smart Fallbacks</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complex questions transfer with context.
                </p>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <BlurReveal blurAmount={8}>
            <div className="mx-auto max-w-2xl rounded-xl border bg-card p-8 md:p-10 text-center">
              <h2 className="text-2xl font-bold">Ready for the real thing?</h2>
              <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
                Customers call your number and have real conversations with the AI—just like above.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                <MagneticButton strength={0.15}>
                  <Button size="lg" className="btn-primary-glow h-12" asChild>
                    <Link href="/sign-up">
                      Start Free Trial
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </MagneticButton>
                <MagneticButton strength={0.1}>
                  <Button variant="ghost" className="text-muted-foreground" asChild>
                    <Link href="/contact">Schedule a call</Link>
                  </Button>
                </MagneticButton>
              </div>
            </div>
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
