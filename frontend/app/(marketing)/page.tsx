import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Phone, Clock, Wrench, Zap, CheckCircle2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metadata } from "next";
import { HowItWorksSection, PoweredBySection, IntegrationsSection } from "@/components/marketing";
import {
  ScrollReveal,
  StaggerContainer,
  StaggerItem,
  ScaleReveal,
  AnimatedCounter,
  AnimatedTextCounter,
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
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-24 lg:py-32">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <ScrollReveal delay={0}>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-2 text-sm backdrop-blur-xl">
              <span className="status-dot status-dot-active" />
              <span className="text-muted-foreground">Now available for auto shops</span>
            </div>
          </ScrollReveal>

          {/* Headline */}
          <ScrollReveal delay={0.1}>
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Your AI-Powered{" "}
              <span className="gradient-text">Phone Receptionist</span>
            </h1>
          </ScrollReveal>

          <ScrollReveal delay={0.2}>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Never miss a customer call again. Our AI handles inquiries about
              repair status, business hours, and services—24/7, with human-like
              conversation.
            </p>
          </ScrollReveal>

          {/* CTA Buttons */}
          <ScrollReveal delay={0.3}>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gradient-bg border-0 h-12 px-8 text-base glow" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  Try Live Demo
                </Link>
              </Button>
            </div>
          </ScrollReveal>

          {/* Social Proof */}
          <ScrollReveal delay={0.4}>
            <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>No credit card required</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Setup in 5 minutes</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span>Cancel anytime</span>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* How It Works Section - Using animated component */}
      <HowItWorksSection />

      {/* Features Section */}
      <section id="features" className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything Your Shop Needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Let AI handle routine calls while you focus on what matters—fixing cars.
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="mt-16 grid gap-8 md:grid-cols-3" staggerDelay={0.15}>
            {/* Feature 1 */}
            <StaggerItem>
              <div className="group rounded-2xl border bg-card p-8 hover-lift h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Check Repair Status</h3>
                <p className="mt-3 text-muted-foreground">
                  Customers call to check on their vehicle. The AI looks up their
                  work order and provides real-time updates instantly.
                </p>
              </div>
            </StaggerItem>

            {/* Feature 2 */}
            <StaggerItem>
              <div className="group rounded-2xl border bg-card p-8 hover-lift h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Hours & Location</h3>
                <p className="mt-3 text-muted-foreground">
                  Automatically answers questions about your shop&apos;s hours,
                  location, and directions—even after hours.
                </p>
              </div>
            </StaggerItem>

            {/* Feature 3 */}
            <StaggerItem>
              <div className="group rounded-2xl border bg-card p-8 hover-lift h-full">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Smart Transfers</h3>
                <p className="mt-3 text-muted-foreground">
                  For complex questions, the AI seamlessly transfers the call to
                  your team with full context of the conversation.
                </p>
              </div>
            </StaggerItem>
          </StaggerContainer>

          <ScrollReveal delay={0.3}>
            <div className="mt-12 text-center">
              <Button variant="outline" size="lg" asChild>
                <Link href="/features">
                  See All Features
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <ScaleReveal>
            <div className="mx-auto max-w-4xl rounded-3xl gradient-bg p-12 text-center text-white">
              <Zap className="mx-auto h-12 w-12 mb-6" />
              <h2 className="text-3xl font-bold sm:text-4xl">
                Experience It Yourself
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
                Try our interactive demo to see how Voice AI handles real customer calls. Listen to sample conversations or chat with our AI.
              </p>
              <Button size="lg" variant="secondary" className="mt-8 h-12 px-8 text-base" asChild>
                <Link href="/demo">
                  <Play className="mr-2 h-4 w-4" />
                  Try the Demo
                </Link>
              </Button>
            </div>
          </ScaleReveal>
        </div>
      </section>

      {/* Stats Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <StaggerContainer className="grid gap-8 text-center md:grid-cols-3" staggerDelay={0.2}>
            <StaggerItem>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">
                  <AnimatedTextCounter text="24/7" />
                </div>
                <div className="text-muted-foreground">Always Available</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">
                  <AnimatedTextCounter text="<1s" />
                </div>
                <div className="text-muted-foreground">Response Time</div>
              </div>
            </StaggerItem>
            <StaggerItem>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">
                  <AnimatedCounter value={95} suffix="%" />
                </div>
                <div className="text-muted-foreground">Calls Handled</div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* Powered By Section */}
      <PoweredBySection />

      {/* Integrations Section */}
      <IntegrationsSection />

      {/* Testimonials Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">
                What Shop Owners Say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Hear from auto shops already using Voice AI
              </p>
            </div>
          </ScrollReveal>

          <StaggerContainer className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto" staggerDelay={0.15}>
            {/* Testimonial 1 */}
            <StaggerItem direction="left">
              <div className="rounded-2xl border bg-card p-8 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  &quot;We used to miss 30% of our calls during busy hours. Now every call gets answered instantly. Customers love getting immediate updates on their repairs.&quot;
                </p>
                <div>
                  <p className="font-semibold">Mike Johnson</p>
                  <p className="text-sm text-muted-foreground">Mike&apos;s Auto Repair, Denver</p>
                </div>
              </div>
            </StaggerItem>

            {/* Testimonial 2 */}
            <StaggerItem>
              <div className="rounded-2xl border bg-card p-8 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  &quot;Setup took 10 minutes. The AI sounds natural and customers often don&apos;t realize they&apos;re not talking to a person. Game changer for our small shop.&quot;
                </p>
                <div>
                  <p className="font-semibold">Sarah Chen</p>
                  <p className="text-sm text-muted-foreground">City Garage, Austin</p>
                </div>
              </div>
            </StaggerItem>

            {/* Testimonial 3 */}
            <StaggerItem direction="right">
              <div className="rounded-2xl border bg-card p-8 h-full">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-muted-foreground mb-6">
                  &quot;The privacy-first approach sold me. No call recordings, just clean summaries. I know exactly what happened on each call without storing sensitive data.&quot;
                </p>
                <div>
                  <p className="font-semibold">Robert Martinez</p>
                  <p className="text-sm text-muted-foreground">Express Repair, Phoenix</p>
                </div>
              </div>
            </StaggerItem>
          </StaggerContainer>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-t py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-16">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Got questions? We&apos;ve got answers.
              </p>
            </div>
          </ScrollReveal>

          <div className="mx-auto max-w-3xl space-y-4">
            {[
              {
                q: "How does the AI know about my shop's data?",
                a: "You upload your work orders via CSV or connect your shop management system. The AI only has access to the data you provide—it never guesses or makes up information."
              },
              {
                q: "What happens if the AI can't answer a question?",
                a: "If the AI isn't confident about an answer, it gracefully transfers the call to your team with full context of what was discussed. No frustrated customers."
              },
              {
                q: "Do you record phone calls?",
                a: "No. We're privacy-first by design. We don't store call recordings or full transcripts. You get structured summaries showing intent, outcome, and any data accessed."
              },
              {
                q: "How long does setup take?",
                a: "Most shops are up and running in under 5 minutes. Upload your data, customize your greeting, and you're ready to take calls."
              },
              {
                q: "Can I try it before committing?",
                a: "Absolutely! We offer a free trial so you can experience how Voice AI handles real calls for your shop. No credit card required."
              }
            ].map((faq, i) => (
              <ScrollReveal key={i} delay={i * 0.1}>
                <div className="rounded-xl border bg-card p-6">
                  <h3 className="font-semibold text-lg">{faq.q}</h3>
                  <p className="mt-2 text-muted-foreground">{faq.a}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Phone Support?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join auto shops that never miss a customer call. Get started in minutes.
            </p>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gradient-bg border-0 h-12 px-8 text-base glow" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="/contact">
                  Talk to Sales
                </Link>
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
