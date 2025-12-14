import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  BlurReveal,
  ScrollReveal,
  TextReveal,
  GradientTextReveal,
  MagneticButton,
} from "@/components/animations";

export const metadata = {
  title: "Pricing - Voice AI",
  description: "Simple, transparent pricing for Voice AI - your AI-powered phone receptionist.",
};

const plans = [
  {
    name: "Starter",
    description: "For small shops getting started",
    price: 49,
    period: "month",
    features: [
      "Up to 100 calls/month",
      "AI phone receptionist",
      "Repair status lookups",
      "Business hours & location",
      "Call summaries",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "For busy shops with high volume",
    price: 99,
    period: "month",
    features: [
      "Up to 500 calls/month",
      "Everything in Starter",
      "Smart call transfers",
      "Custom greetings",
      "Analytics dashboard",
      "Priority support",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For multi-location shops",
    price: null,
    period: null,
    features: [
      "Unlimited calls",
      "Everything in Professional",
      "Shop integrations",
      "Dedicated manager",
      "Custom AI training",
      "SLA guarantee",
    ],
    cta: "Contact Sales",
    popular: false,
  },
];

const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes! Every plan comes with a 14-day free trial. No credit card required to start.",
  },
  {
    q: "What counts as a call?",
    a: "Any inbound call to your AI phone number counts as one call, regardless of duration. Outbound calls and transfers to your team don't count.",
  },
  {
    q: "Can I change plans later?",
    a: "Absolutely. Upgrade or downgrade anytime. Changes take effect on your next billing cycle.",
  },
  {
    q: "What if I go over my call limit?",
    a: "We'll notify you when you're approaching your limit. Overage calls are billed at $0.50 each, or you can upgrade to a higher plan.",
  },
  {
    q: "Do you offer annual billing?",
    a: "Yes! Annual plans get 2 months free. Contact us for details.",
  },
];

export default function PricingPage() {
  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-20 lg:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <BlurReveal delay={0} direction="none">
            <p className="section-eyebrow">Pricing</p>
          </BlurReveal>
          <h1 className="heading-display">
            <TextReveal text="Simple, transparent" delay={0.1} />
            {" "}
            <GradientTextReveal delay={0.3}>pricing</GradientTextReveal>
          </h1>
          <BlurReveal delay={0.4} blurAmount={6}>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. No hidden fees, no contracts.
            </p>
          </BlurReveal>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="container mx-auto px-4">
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <BlurReveal key={plan.name} delay={0.1 + index * 0.1} blurAmount={6}>
                <div
                  className={`relative rounded-xl border bg-card p-6 h-full ${
                    plan.popular
                      ? "border-primary ring-1 ring-primary/20"
                      : ""
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="gradient-bg text-white text-xs font-medium px-3 py-1 rounded-full">
                        Popular
                      </span>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {plan.description}
                    </p>

                    <div className="mt-5">
                      {plan.price !== null ? (
                        <>
                          <span className="text-3xl font-bold">${plan.price}</span>
                          <span className="text-muted-foreground text-sm">/{plan.period}</span>
                        </>
                      ) : (
                        <span className="text-3xl font-bold">Custom</span>
                      )}
                    </div>
                  </div>

                  <ul className="mt-6 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6">
                    <MagneticButton strength={plan.popular ? 0.15 : 0.1} className="w-full">
                      <Button
                        className={`w-full ${
                          plan.popular ? "btn-primary-glow" : ""
                        }`}
                        variant={plan.popular ? "default" : "outline"}
                        asChild
                      >
                        <Link href={plan.price !== null ? "/sign-up" : "/contact"}>
                          {plan.cta}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    </MagneticButton>
                  </div>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="border-t bg-muted/20 py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-12">
              <p className="section-eyebrow">Compare</p>
              <h2 className="heading-section">Compare plans</h2>
            </div>
          </ScrollReveal>

          <BlurReveal delay={0.2} blurAmount={4}>
            <div className="max-w-3xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-muted-foreground">Feature</th>
                  <th className="text-center py-3 px-4 font-medium">Starter</th>
                  <th className="text-center py-3 px-4 font-medium">Pro</th>
                  <th className="text-center py-3 px-4 font-medium">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Monthly calls", starter: "100", pro: "500", enterprise: "Unlimited" },
                  { feature: "AI receptionist", starter: true, pro: true, enterprise: true },
                  { feature: "Status lookups", starter: true, pro: true, enterprise: true },
                  { feature: "Smart transfers", starter: false, pro: true, enterprise: true },
                  { feature: "Custom greetings", starter: false, pro: true, enterprise: true },
                  { feature: "Analytics", starter: false, pro: true, enterprise: true },
                  { feature: "Shop integrations", starter: false, pro: false, enterprise: true },
                  { feature: "SLA guarantee", starter: false, pro: false, enterprise: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-3 px-4 text-muted-foreground">{row.feature}</td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-foreground">{row.starter}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-foreground">{row.pro}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="h-4 w-4 text-primary mx-auto" />
                        ) : (
                          <span className="text-muted-foreground/50">—</span>
                        )
                      ) : (
                        <span className="text-foreground">{row.enterprise}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </BlurReveal>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 lg:py-24">
        <div className="container mx-auto px-4">
          <ScrollReveal>
            <div className="mx-auto max-w-2xl text-center mb-10">
              <p className="section-eyebrow">FAQ</p>
              <h2 className="heading-section">Pricing questions</h2>
            </div>
          </ScrollReveal>

          <div className="mx-auto max-w-2xl space-y-3">
            {faqs.map((faq, i) => (
              <BlurReveal key={i} delay={i * 0.05} blurAmount={4}>
                <div className="rounded-lg border bg-card p-5">
                  <h3 className="font-medium">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{faq.a}</p>
                </div>
              </BlurReveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/20 py-20 lg:py-24">
        <div className="container mx-auto px-4 text-center">
          <ScrollReveal>
            <h2 className="heading-section">Ready to get started?</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Start your free trial today. No credit card required.
            </p>
          </ScrollReveal>
          <BlurReveal delay={0.2}>
            <MagneticButton strength={0.15}>
              <Button size="lg" className="mt-8 btn-primary-glow h-14 px-8 text-base" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </MagneticButton>
          </BlurReveal>
        </div>
      </section>
    </>
  );
}
