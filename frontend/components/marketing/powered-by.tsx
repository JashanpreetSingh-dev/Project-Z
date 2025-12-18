"use client";

import { OpenAILogo, TwilioLogo } from "@/components/icons";
import { ScrollReveal, StaggerGrid } from "@/components/animations";

const partners = [
  {
    name: "OpenAI",
    description: "Akseli & Language Models",
    Logo: OpenAILogo,
  },
  {
    name: "Twilio",
    description: "Telephony Infrastructure",
    Logo: TwilioLogo,
  },
];

export function PoweredBySection() {
  return (
    <section className="py-16 border-t">
      <div className="container mx-auto px-4">
        <ScrollReveal>
          <div className="text-center mb-10">
            <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Powered by industry leaders
            </p>
          </div>
        </ScrollReveal>

        <StaggerGrid
          className="flex flex-wrap items-center justify-center gap-12 md:gap-16"
          staggerDelay={0.15}
        >
          {partners.map((partner) => (
            <div key={partner.name} className="group flex flex-col items-center gap-2 transition-all">
              <partner.Logo className="h-8 text-muted-foreground group-hover:text-foreground transition-colors duration-300" />
              <span className="text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                {partner.description}
              </span>
            </div>
          ))}
        </StaggerGrid>
      </div>
    </section>
  );
}
