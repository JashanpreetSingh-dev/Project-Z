import Link from "next/link";
import { Zap } from "lucide-react";
import { OpenAILogo, TwilioLogo } from "@/components/icons";

const footerLinks = {
  product: [
    { label: "Features", href: "/features" },
    { label: "Pricing", href: "/pricing" },
    { label: "Demo", href: "/demo" },
  ],
  company: [
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
  ],
  legal: [
    { label: "Privacy", href: "/privacy" },
    { label: "Terms", href: "/terms" },
  ],
};

export function MarketingFooter() {
  return (
    <footer className="border-t">
      <div className="container mx-auto px-4 py-12 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-5">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg gradient-bg">
                <Zap className="h-3.5 w-3.5 text-white" />
              </div>
              <span className="font-semibold">Voice AI</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground max-w-xs">
              AI phone receptionist for auto shops. Never miss a call.
            </p>
            {/* Powered by - inline */}
            <div className="mt-6 flex items-center gap-4">
              <span className="text-xs text-muted-foreground">Powered by</span>
              <OpenAILogo className="h-4 text-muted-foreground/60" />
              <TwilioLogo className="h-4 text-muted-foreground/60" />
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-3 gap-8 lg:col-span-3">
            {/* Product Links */}
            <div>
              <h3 className="text-sm font-medium mb-3">Product</h3>
              <ul className="space-y-2">
                {footerLinks.product.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-sm font-medium mb-3">Company</h3>
              <ul className="space-y-2">
                {footerLinks.company.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-sm font-medium mb-3">Legal</h3>
              <ul className="space-y-2">
                {footerLinks.legal.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} Voice AI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
