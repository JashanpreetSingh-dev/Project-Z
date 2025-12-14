import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ArrowRight, Phone, Clock, Wrench, Zap, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Gradient Background Effect */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-gradient-to-br from-primary/20 via-transparent to-transparent blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-gradient-to-tl from-primary/10 via-transparent to-transparent blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="container mx-auto px-4 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold">Voice AI</span>
            </div>
            <div className="flex items-center gap-3">
              <ThemeToggle />
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button className="gradient-bg border-0" asChild>
                <Link href="/sign-up">
                  Get Started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main>
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="mx-auto max-w-4xl text-center animate-fade-in-up">
            {/* Badge */}
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border bg-card/50 px-4 py-2 text-sm backdrop-blur-xl">
              <span className="status-dot status-dot-active" />
              <span className="text-muted-foreground">Now available for auto shops</span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              Your AI-Powered{" "}
              <span className="gradient-text">Phone Receptionist</span>
            </h1>
            
            <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Never miss a customer call again. Our AI handles inquiries about
              repair status, business hours, and services—24/7, with human-like
              conversation.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button size="lg" className="gradient-bg border-0 h-12 px-8 text-base glow" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base" asChild>
                <Link href="#features">
                  See How It Works
                </Link>
              </Button>
            </div>

            {/* Social Proof */}
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
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold sm:text-4xl">
                Everything Your Shop Needs
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Let AI handle routine calls while you focus on what matters—fixing cars.
              </p>
            </div>

            <div className="mt-16 grid gap-8 md:grid-cols-3 stagger-children">
              {/* Feature 1 */}
              <div className="group rounded-2xl border bg-card p-8 hover-lift">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Wrench className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Check Repair Status</h3>
                <p className="mt-3 text-muted-foreground">
                  Customers call to check on their vehicle. The AI looks up their
                  work order and provides real-time updates instantly.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="group rounded-2xl border bg-card p-8 hover-lift">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Clock className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Hours & Location</h3>
                <p className="mt-3 text-muted-foreground">
                  Automatically answers questions about your shop&apos;s hours,
                  location, and directions—even after hours.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="group rounded-2xl border bg-card p-8 hover-lift">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Phone className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">Smart Transfers</h3>
                <p className="mt-3 text-muted-foreground">
                  For complex questions, the AI seamlessly transfers the call to
                  your team with full context of the conversation.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="border-t py-24">
          <div className="container mx-auto px-4">
            <div className="grid gap-8 text-center md:grid-cols-3">
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">24/7</div>
                <div className="text-muted-foreground">Always Available</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">&lt;1s</div>
                <div className="text-muted-foreground">Response Time</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl font-bold gradient-text">95%</div>
                <div className="text-muted-foreground">Calls Handled</div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="border-t bg-muted/30 py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Ready to Transform Your Phone Support?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
              Join auto shops that never miss a customer call. Get started in minutes.
            </p>
            <Button size="lg" className="mt-8 gradient-bg border-0 h-12 px-8 text-base glow" asChild>
              <Link href="/sign-up">
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} Voice AI. Built for auto shops.</p>
        </div>
      </footer>
    </div>
  );
}
