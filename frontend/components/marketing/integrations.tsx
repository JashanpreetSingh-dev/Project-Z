"use client";

import { Check } from "lucide-react";
import { TekmetricLogo, ShopWareLogo } from "@/components/icons";
import { ScrollReveal } from "@/components/animations";

const integrations = [
  {
    name: "Tekmetric",
    description: "Sync work orders and customer data automatically.",
    Logo: TekmetricLogo,
  },
  {
    name: "Shop-Ware",
    description: "Seamless access to repair orders and customers.",
    Logo: ShopWareLogo,
  },
];

export function IntegrationsSection() {
  return (
    <section className="py-20 lg:py-24 border-t">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="mx-auto max-w-2xl text-center mb-12">
            <p className="section-eyebrow">Integrations</p>
            <h2 className="heading-section">
              Works with your shop software
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-4 md:grid-cols-2 max-w-2xl mx-auto">
          {integrations.map((integration, index) => (
            <ScrollReveal key={integration.name} delay={index * 0.1}>
              <div className="card-feature h-full">
                <div className="flex items-center justify-between mb-3">
                  <integration.Logo className="h-7 text-foreground" />
                  <span className="inline-flex items-center gap-1 text-xs text-primary">
                    <Check className="h-3 w-3" />
                    Available
                  </span>
                </div>
                <h3 className="font-semibold text-sm">{integration.name}</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  {integration.description}
                </p>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal delay={0.2}>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            More integrations coming soon
          </p>
        </ScrollReveal>
      </div>
    </section>
  );
}
