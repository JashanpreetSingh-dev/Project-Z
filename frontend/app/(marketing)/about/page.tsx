import Link from "next/link";
import { ArrowRight, Shield, Zap, Heart, Target } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About - Akseli",
  description: "Learn about Akseli and our mission to help auto shops never miss a customer call.",
};

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Built for{" "}
            <span className="gradient-text">Auto Shops</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            We&apos;re on a mission to help independent auto repair shops provide
            exceptional customer service without the overhead of a full-time receptionist.
          </p>
        </div>
      </section>

      {/* The Problem */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 items-center max-w-5xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold sm:text-4xl">
                The Problem We Saw
              </h2>
              <p className="mt-6 text-muted-foreground">
                Independent auto repair shops are busy places. Mechanics are elbow-deep
                in engines, and there&apos;s often no one available to answer the phone.
              </p>
              <p className="mt-4 text-muted-foreground">
                The result? Missed calls. Frustrated customers. Lost revenue. And the
                same questions asked over and over: &quot;Is my car ready?&quot; &quot;What are your
                hours?&quot; &quot;Where are you located?&quot;
              </p>
              <p className="mt-4 text-muted-foreground">
                Existing solutions—IVRs, answering services, generic AI chatbots—either
                frustrate customers or give wrong answers. We knew there had to be a
                better way.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-destructive">30%</div>
                <div className="text-sm text-muted-foreground mt-1">Calls missed during busy hours</div>
              </div>
              <div className="rounded-2xl border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-destructive">60%</div>
                <div className="text-sm text-muted-foreground mt-1">Are repeat questions</div>
              </div>
              <div className="rounded-2xl border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-destructive">$1000s</div>
                <div className="text-sm text-muted-foreground mt-1">Lost in revenue per month</div>
              </div>
              <div className="rounded-2xl border bg-card p-6 text-center">
                <div className="text-3xl font-bold text-destructive">0</div>
                <div className="text-sm text-muted-foreground mt-1">Good AI options existed</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Solution */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Our Approach
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We built Akseli with a different philosophy than other AI tools.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 max-w-4xl mx-auto">
            <div className="rounded-2xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <Target className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Purpose-Built</h3>
              <p className="mt-3 text-muted-foreground">
                We&apos;re not a generic AI trying to do everything. Akseli is built
                specifically for auto shops, understanding the unique needs of your
                business and your customers.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Tool-Based, Not Chat-Based</h3>
              <p className="mt-3 text-muted-foreground">
                Our AI doesn&apos;t guess or make things up. It uses structured tools to
                look up real data from your shop. If it doesn&apos;t know, it says so and
                transfers to your team.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Privacy First</h3>
              <p className="mt-3 text-muted-foreground">
                We don&apos;t store call recordings or transcripts. You get clean summaries
                of what happened—intent, outcome, data accessed—without surveillance.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-8">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary mb-6">
                <Heart className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-semibold">Owner Controlled</h3>
              <p className="mt-3 text-muted-foreground">
                You&apos;re in charge. Customize greetings, control what the AI can answer,
                set fallback behaviors. It&apos;s your receptionist, working your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Privacy Commitment */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <Shield className="h-12 w-12 text-primary mx-auto mb-6" />
            <h2 className="text-3xl font-bold sm:text-4xl">
              Our Privacy Commitment
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We believe in earning trust through transparency.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg">No Call Recordings</h3>
              <p className="mt-2 text-muted-foreground">
                We never record or store audio from phone calls. Your customers&apos;
                voices and conversations remain private.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg">No Full Transcripts</h3>
              <p className="mt-2 text-muted-foreground">
                We don&apos;t store verbatim transcripts of what was said. You get structured
                summaries showing intent, tools used, and outcomes.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg">Your Data, Your Control</h3>
              <p className="mt-2 text-muted-foreground">
                The shop data you upload stays yours. We use it only to answer customer
                questions. You can delete it anytime.
              </p>
            </div>

            <div className="rounded-xl border bg-card p-6">
              <h3 className="font-semibold text-lg">Transparent Summaries</h3>
              <p className="mt-2 text-muted-foreground">
                Every call summary shows exactly what data was accessed. No black boxes.
                You always know what happened.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Join Us?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            See how Akseli can help your shop never miss another call.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" className="gradient-bg border-0 h-12 px-8 text-base glow" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
              <Link href="/demo">Try the Demo</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
