import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service - Akseli",
  description: "Akseli's terms of service. Read our terms and conditions for using our AI phone receptionist service.",
};

export default function TermsPage() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Terms of Service</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Agreement to Terms</h2>
            <p className="text-muted-foreground">
              By accessing or using Akseli&apos;s services, you agree to be bound by these Terms 
              of Service. If you disagree with any part of the terms, you may not access our service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Description of Service</h2>
            <p className="text-muted-foreground">
              Akseli provides an AI-powered phone receptionist service designed for auto repair shops. 
              Our service answers incoming phone calls and provides information based on data you provide.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Responsibilities</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Maintain accurate and up-to-date shop information</li>
              <li>• Ensure data you upload is accurate and you have rights to share it</li>
              <li>• Use the service in compliance with applicable laws</li>
              <li>• Keep your account credentials secure</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Service Limitations</h2>
            <p className="text-muted-foreground">
              Akseli is designed to handle routine customer inquiries. It is not a replacement 
              for professional advice, emergency services, or complex customer service situations. 
              The AI will transfer calls to your team when it cannot confidently answer a question.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Billing and Payments</h2>
            <p className="text-muted-foreground">
              Subscription fees are billed monthly or annually based on your selected plan. 
              Overages are billed at the rates specified in your plan. You may cancel your 
              subscription at any time.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Intellectual Property</h2>
            <p className="text-muted-foreground">
              The Akseli service, including its technology, branding, and content, is owned 
              by Akseli and protected by intellectual property laws. You retain ownership of 
              all data you upload to the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Akseli shall not be liable for any indirect, incidental, special, consequential, 
              or punitive damages resulting from your use of the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Changes to Terms</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. We will notify you of 
              significant changes via email or through the service.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these terms, please contact us at{" "}
              <a href="mailto:legal@voiceai.com" className="text-primary hover:underline">
                legal@voiceai.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
