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

export const metadata = {
  title: "Features - Voice AI",
  description: "Explore all the features of Voice AI - your AI-powered phone receptionist for auto shops.",
};

const features = [
  {
    icon: Phone,
    title: "24/7 Availability",
    description: "Your AI receptionist never sleeps, takes breaks, or calls in sick. Every call gets answered instantly, day or night, weekends and holidays included.",
    highlights: ["Always available", "Instant pickup", "No hold times"],
  },
  {
    icon: Wrench,
    title: "Repair Status Lookup",
    description: "Customers call asking about their vehicle. The AI looks up their work order by name, phone number, or ticket ID and provides real-time status updates.",
    highlights: ["Real-time updates", "Multiple lookup methods", "Accurate information"],
  },
  {
    icon: Clock,
    title: "Business Hours & Location",
    description: "Automatically answers common questions about your shop's hours of operation, location, and directions—even when you're closed.",
    highlights: ["After-hours support", "Location details", "Holiday hours"],
  },
  {
    icon: PhoneForwarded,
    title: "Smart Call Transfers",
    description: "When the AI can't confidently answer a question, it seamlessly transfers the call to your team with full context of what was discussed.",
    highlights: ["Context handoff", "Graceful fallback", "No frustrated callers"],
  },
  {
    icon: FileText,
    title: "Call Summaries",
    description: "Get clean, structured summaries of every call. See what intent was detected, what data was accessed, and the outcome—without full transcripts.",
    highlights: ["Structured data", "Intent tracking", "Outcome logging"],
  },
  {
    icon: Lock,
    title: "Privacy-First Design",
    description: "We never store call recordings or full transcripts. Your customers' conversations stay private. You get summaries, not surveillance.",
    highlights: ["No recordings", "No transcripts", "Data minimization"],
  },
  {
    icon: BarChart3,
    title: "Dashboard Analytics",
    description: "Monitor your AI receptionist's performance. See call volumes, common questions, transfer rates, and customer satisfaction trends.",
    highlights: ["Call insights", "Performance metrics", "Trend analysis"],
  },
  {
    icon: Settings,
    title: "Easy Configuration",
    description: "Customize greetings, business info, and AI behavior from your dashboard. Update your work orders via CSV upload or integrate with shop management systems.",
    highlights: ["Custom greetings", "CSV upload", "Quick setup"],
  },
];

export default function FeaturesPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Everything You Need to{" "}
            <span className="gradient-text">Never Miss a Call</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Voice AI handles routine customer calls so you can focus on repairs.
            Here&apos;s everything your AI receptionist can do.
          </p>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-2 stagger-children">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border bg-card p-8 hover-lift"
              >
                <div className="flex items-start gap-6">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                    <feature.icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                    <p className="mt-2 text-muted-foreground">
                      {feature.description}
                    </p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {feature.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                        >
                          {highlight}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How We're Different */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Built Different
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Unlike generic AI assistants, Voice AI is designed specifically for auto shops.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-500/10 text-green-500">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">Tool-Based, Not Chat-Based</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Our AI uses structured tools to look up real data. It never guesses or makes things up.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500">
                <Shield className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">Privacy by Design</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                No recordings, no transcripts, no surveillance. Just clean summaries you can trust.
              </p>
            </div>

            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500">
                <MessageSquare className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-lg">Graceful Fallbacks</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                When unsure, the AI transfers to your team with context. No dead ends for customers.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to See It in Action?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Try our interactive demo or start your free trial today.
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
