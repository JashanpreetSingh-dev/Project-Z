import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Phone, Clock, Wrench, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { HeroSection, HowItWorksSection, IntegrationsSection } from "@/components/marketing";
import {
  ScrollReveal,
  ScaleReveal,
  AnimatedCounter,
  BlurReveal,
} from "@/components/animations";

export const metadata: Metadata = {
  title: "Voice AI - AI Phone Receptionist for Auto Shops",
  description: "Never miss a customer call again. Voice AI handles repair status inquiries, business hours, and more—24/7, with human-like conversation.",
  openGraph: {
    title: "Voice AI - AI Phone Receptionist for Auto Shops",
    description: "Never miss a customer call again. Voice AI handles repair status inquiries, business hours, and more—24/7.",
    type: "website",
  },
};

// Force dynamic rendering to prevent static generation with Clerk
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <>
      {/* Hero Section - Client component with animations */}
      <HeroSection />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/20 py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <p className="section-eyebrow">Features</p>
              <h2 className="heading-section">
                Everything your shop needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Handle routine calls automatically so you can focus on repairs.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto max-w-5xl grid gap-6 md:grid-cols-3">
            {/* Feature 1 */}
            <BlurReveal delay={0.1} blurAmount={6}>
              <div className="card-feature h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Wrench className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Repair Status</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  AI looks up work orders and provides real-time updates to customers instantly.
                </p>
              </div>
            </BlurReveal>

            {/* Feature 2 */}
            <BlurReveal delay={0.2} blurAmount={6}>
              <div className="card-feature h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Hours & Location</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Answers questions about hours, location, and directions—even after hours.
                </p>
              </div>
            </BlurReveal>

            {/* Feature 3 */}
            <BlurReveal delay={0.3} blurAmount={6}>
              <div className="card-feature h-full">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Phone className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">Smart Transfers</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complex questions get transferred to your team with full context.
                </p>
              </div>
            </BlurReveal>
          </div>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center">
              <Button variant="ghost" className="text-muted-foreground hover:text-foreground" asChild>
                <Link href="/features">
                  View all features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Stats Section - Clean, inline with content */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-3 gap-8 text-center">
              <ScrollReveal delay={0.1}>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">24/7</div>
                  <div className="mt-1 text-sm text-muted-foreground">Availability</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.15}>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">&lt;1s</div>
                  <div className="mt-1 text-sm text-muted-foreground">Response</div>
                </div>
              </ScrollReveal>
              <ScrollReveal delay={0.2}>
                <div>
                  <div className="text-3xl sm:text-4xl font-bold text-foreground">
                    <AnimatedCounter value={95} suffix="%" />
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">Handled</div>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-16 lg:py-20">
        <div className="container mx-auto px-4">
          <ScaleReveal>
            <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 md:p-12 text-center">
              <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded-xl gradient-bg">
                <Play className="h-5 w-5 text-white" />
              </div>
              <h2 className="text-2xl font-bold sm:text-3xl">
                Hear it in action
              </h2>
              <p className="mx-auto mt-3 max-w-md text-muted-foreground">
                Listen to real AI conversations and see how it handles customer calls.
              </p>
              <Button size="lg" variant="outline" className="mt-6" asChild>
                <Link href="/demo">
                  Try the Demo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScaleReveal>
        </div>
      </section>

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* Testimonials Section */}
      <section className="border-t bg-muted/20 py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">Testimonials</p>
              <h2 className="heading-section">
                Trusted by shop owners
              </h2>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Testimonial 1 */}
            <BlurReveal delay={0.1} blurAmount={6}>
              <div className="rounded-xl border bg-card p-6 h-full">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;We used to miss 30% of our calls during busy hours. Now every call gets answered instantly. Customers love getting immediate updates.&quot;
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-sm">Mike Johnson</p>
                  <p className="text-xs text-muted-foreground">Mike&apos;s Auto Repair, Denver</p>
                </div>
              </div>
            </BlurReveal>

            {/* Testimonial 2 */}
            <BlurReveal delay={0.2} blurAmount={6}>
              <div className="rounded-xl border bg-card p-6 h-full">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;Setup took 10 minutes. The AI sounds natural and customers often don&apos;t realize they&apos;re not talking to a person. Game changer.&quot;
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-sm">Sarah Chen</p>
                  <p className="text-xs text-muted-foreground">City Garage, Austin</p>
                </div>
              </div>
            </BlurReveal>

            {/* Testimonial 3 */}
            <BlurReveal delay={0.3} blurAmount={6}>
              <div className="rounded-xl border bg-card p-6 h-full">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;The privacy-first approach sold me. No recordings, just clean summaries. I know what happened without storing sensitive data.&quot;
                </p>
                <div className="mt-4 pt-4 border-t">
                  <p className="font-medium text-sm">Robert Martinez</p>
                  <p className="text-xs text-muted-foreground">Express Repair, Phoenix</p>
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="heading-section">
                Common questions
              </h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto max-w-2xl space-y-3">
            {[
              {
                q: "How does the AI know about my shop's data?",
                a: "Upload work orders via CSV or connect your shop management system. The AI only accesses data you provide—it never guesses."
              },
              {
                q: "What if the AI can't answer a question?",
                a: "It transfers the call to your team with full context. No frustrated customers, no dead ends."
              },
              {
                q: "Do you record phone calls?",
                a: "No. We're privacy-first. No recordings, no transcripts—just structured summaries."
              },
              {
                q: "How long does setup take?",
                a: "Most shops are up and running in under 5 minutes."
              }
            ].map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.05}>
                <div className="rounded-lg border bg-card p-5">
                  <h3 className="font-medium">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t bg-muted/20 py-24 lg:py-32">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="heading-section">
              Ready to get started?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join auto shops that never miss a customer call.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.1}>
            <div className="mt-8">
              <Button size="lg" className="btn-primary-glow h-14 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Get Started Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              No credit card required
            </p>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
