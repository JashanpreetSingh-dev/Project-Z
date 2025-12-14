import Link from "next/link";
import { ArrowRight, Check, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Pricing - Voice AI",
  description: "Simple, transparent pricing for Voice AI - your AI-powered phone receptionist.",
};

const plans = [
  {
    name: "Starter",
    description: "Perfect for small shops just getting started",
    price: 49,
    period: "month",
    features: [
      "Up to 100 calls/month",
      "AI phone receptionist",
      "Repair status lookups",
      "Business hours & location",
      "Call summaries dashboard",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "Professional",
    description: "For busy shops with high call volumes",
    price: 99,
    period: "month",
    features: [
      "Up to 500 calls/month",
      "Everything in Starter",
      "Smart call transfers",
      "Priority support",
      "Custom greeting messages",
      "CSV data upload",
      "Analytics dashboard",
    ],
    cta: "Start Free Trial",
    popular: true,
  },
  {
    name: "Enterprise",
    description: "For multi-location or high-volume shops",
    price: null,
    period: null,
    features: [
      "Unlimited calls",
      "Everything in Professional",
      "Shop management integrations",
      "Dedicated account manager",
      "Custom AI training",
      "SLA guarantee",
      "Phone support",
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
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent{" "}
            <span className="gradient-text">Pricing</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Start free, upgrade when you&apos;re ready. No hidden fees, no contracts.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto stagger-children">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border bg-card p-8 ${
                  plan.popular
                    ? "border-primary shadow-lg ring-2 ring-primary/20"
                    : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="gradient-bg text-white text-sm font-medium px-4 py-1 rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {plan.description}
                  </p>

                  <div className="mt-6">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold">${plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold">Custom</span>
                    )}
                  </div>
                </div>

                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  <Button
                    className={`w-full ${
                      plan.popular ? "gradient-bg border-0" : ""
                    }`}
                    variant={plan.popular ? "default" : "outline"}
                    size="lg"
                    asChild
                  >
                    <Link href={plan.price !== null ? "/sign-up" : "/contact"}>
                      {plan.cta}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Compare Plans
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              See what&apos;s included in each plan
            </p>
          </div>

          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-4 font-semibold">Feature</th>
                  <th className="text-center py-4 px-4 font-semibold">Starter</th>
                  <th className="text-center py-4 px-4 font-semibold">Professional</th>
                  <th className="text-center py-4 px-4 font-semibold">Enterprise</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Monthly calls", starter: "100", pro: "500", enterprise: "Unlimited" },
                  { feature: "AI receptionist", starter: true, pro: true, enterprise: true },
                  { feature: "Status lookups", starter: true, pro: true, enterprise: true },
                  { feature: "Smart transfers", starter: false, pro: true, enterprise: true },
                  { feature: "Custom greetings", starter: false, pro: true, enterprise: true },
                  { feature: "Analytics dashboard", starter: false, pro: true, enterprise: true },
                  { feature: "Shop integrations", starter: false, pro: false, enterprise: true },
                  { feature: "Priority support", starter: false, pro: true, enterprise: true },
                  { feature: "Phone support", starter: false, pro: false, enterprise: true },
                  { feature: "SLA guarantee", starter: false, pro: false, enterprise: true },
                ].map((row) => (
                  <tr key={row.feature} className="border-b">
                    <td className="py-4 px-4 text-muted-foreground">{row.feature}</td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.starter === "boolean" ? (
                        row.starter ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.starter
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.pro === "boolean" ? (
                        row.pro ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.pro
                      )}
                    </td>
                    <td className="py-4 px-4 text-center">
                      {typeof row.enterprise === "boolean" ? (
                        row.enterprise ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )
                      ) : (
                        row.enterprise
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Pricing FAQ
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Common questions about our pricing
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded-xl border bg-card p-6">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  {faq.q}
                </h3>
                <p className="mt-2 text-muted-foreground pl-7">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to Get Started?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground">
            Start your free trial today. No credit card required.
          </p>
          <Button size="lg" className="mt-8 gradient-bg border-0 h-12 px-8 text-base glow" asChild>
            <Link href="/sign-up">
              Start Free Trial
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
