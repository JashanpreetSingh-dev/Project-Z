import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Phone, Clock, Wrench, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { HeroSection, HowItWorksSection, IntegrationsSection } from "@/components/marketing";
import { AudioPlayer } from "@/components/demo/audio-player";
import {
  ScrollReveal,
  AnimatedCounter,
  BlurReveal,
  MagneticButton,
  FadeBlur,
} from "@/components/animations";

export const metadata: Metadata = {
  title: "Akseli – Voice AI Phone Receptionist for Auto Shops",
  description: "Never miss a customer call again. Akseli is your Voice AI that handles repair status inquiries, business hours, and more—24/7, with human-like conversation.",
  openGraph: {
    title: "Akseli – Voice AI Phone Receptionist for Auto Shops",
    description: "Never miss a customer call again. Akseli handles repair status inquiries, business hours, and more—24/7.",
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

      {/* Demo Section */}
      <section id="demo" className="border-t py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">Demo</p>
              <h2 className="heading-section">Hear it in action</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Listen to how our AI receptionist handles real calls.
              </p>
            </div>
          </ScrollReveal>

          <FadeBlur delay={0.3}>
            <div className="max-w-4xl mx-auto">
              <AudioPlayer />
            </div>
          </FadeBlur>
        </div>
      </section>

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* Pricing Section */}
      <section id="pricing" className="border-t py-24 lg:py-32">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">Pricing</p>
              <h2 className="heading-section">Simple, transparent pricing</h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Start free. No hidden fees, no contracts.
              </p>
            </div>
          </ScrollReveal>

          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {/* Starter Plan */}
            <BlurReveal delay={0.1} blurAmount={6}>
              <div className="relative rounded-xl border bg-card p-6 h-full">
                <div>
                  <h3 className="text-lg font-semibold">Starter</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    For small shops getting started
                  </p>
                  <div className="mt-5">
                    <span className="text-3xl font-bold">$49</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {["Up to 100 calls/month", "AI phone receptionist", "Repair status lookups", "Business hours & location", "Call summaries"].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/sign-up">Start Free Trial</Link>
                  </Button>
                </div>
              </div>
            </BlurReveal>

            {/* Professional Plan */}
            <BlurReveal delay={0.2} blurAmount={6}>
              <div className="relative rounded-xl border border-primary ring-1 ring-primary/20 bg-card p-6 h-full">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-bg text-white text-xs font-medium px-3 py-1 rounded-full">
                    Popular
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Professional</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    For busy shops with high volume
                  </p>
                  <div className="mt-5">
                    <span className="text-3xl font-bold">$99</span>
                    <span className="text-muted-foreground text-sm">/month</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {["Up to 500 calls/month", "Everything in Starter", "Smart call transfers", "Custom greetings", "Analytics dashboard", "Priority support"].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <MagneticButton strength={0.15} className="w-full">
                    <Button className="w-full btn-primary-glow" asChild>
                      <Link href="/sign-up">
                        Start Free Trial
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </MagneticButton>
                </div>
              </div>
            </BlurReveal>

            {/* Enterprise Plan */}
            <BlurReveal delay={0.3} blurAmount={6}>
              <div className="relative rounded-xl border bg-card p-6 h-full">
                <div>
                  <h3 className="text-lg font-semibold">Enterprise</h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    For multi-location shops
                  </p>
                  <div className="mt-5">
                    <span className="text-3xl font-bold">Custom</span>
                  </div>
                </div>
                <ul className="mt-6 space-y-2.5">
                  {["Unlimited calls", "Everything in Professional", "Shop integrations", "Dedicated manager", "Custom AI training", "SLA guarantee"].map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/contact">Contact Sales</Link>
                  </Button>
                </div>
              </div>
            </BlurReveal>
          </div>
        </div>
      </section>

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
