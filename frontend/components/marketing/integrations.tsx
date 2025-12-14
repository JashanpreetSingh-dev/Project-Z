"use client";

import { CheckCircle2, Clock } from "lucide-react";
import { TekmetricLogo, ShopWareLogo } from "@/components/icons";
import { ScrollReveal, StaggerContainer, StaggerItem } from "@/components/animations";

const integrations = [
  {
    name: "Tekmetric",
    description:
      "Sync work orders, customer data, and repair status automatically from your Tekmetric account.",
    Logo: TekmetricLogo,
    status: "available" as const,
  },
  {
    name: "Shop-Ware",
    description:
      "Connect your Shop-Ware system for seamless access to repair orders and customer information.",
    Logo: ShopWareLogo,
    status: "available" as const,
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-24 bg-muted/30 border-t">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold sm:text-4xl">
              Works With Your Shop Software
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Connect Voice AI to the tools you already use. Pull in work orders
              and customer data automatically.
            </p>
          </div>
        </ScrollReveal>

        <StaggerContainer
          className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto"
          staggerDelay={0.15}
        >
          {integrations.map((integration) => (
            <StaggerItem key={integration.name}>
              <div className="group rounded-2xl border bg-card p-6 hover-lift h-full">
                <div className="flex items-start justify-between mb-4">
                  <integration.Logo className="h-10 text-foreground" />
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-600 dark:text-green-400">
                    <CheckCircle2 className="h-3 w-3" />
                    Available
                  </span>
                </div>
                <h3 className="text-lg font-semibold">{integration.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        <ScrollReveal delay={0.3}>
          <div className="mt-8 text-center">
            <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>More integrations coming soon</span>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
