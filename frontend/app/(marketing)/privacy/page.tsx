import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy - Voice AI",
  description: "Voice AI's privacy policy. Learn how we protect your data and maintain your privacy.",
};

export default function PrivacyPage() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold tracking-tight mb-8">Privacy Policy</h1>
        
        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-6">
          <p className="text-lg text-muted-foreground">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <div className="rounded-xl border bg-card p-6 space-y-4">
            <h2 className="text-xl font-semibold">Our Commitment to Privacy</h2>
            <p className="text-muted-foreground">
              At Voice AI, we believe privacy is a fundamental right. Our service is designed 
              from the ground up to minimize data collection while maximizing value for your business.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What We Don&apos;t Collect</h2>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>No call recordings</strong> - We never record or store audio from phone calls.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>No full transcripts</strong> - We don&apos;t store verbatim conversation transcripts.</span>
              </li>
              <li className="flex gap-2">
                <span className="text-green-500">✓</span>
                <span><strong>No voice biometrics</strong> - We don&apos;t create or store voiceprints.</span>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">What We Do Collect</h2>
            <p className="text-muted-foreground">
              We collect only what&apos;s necessary to provide our service:
            </p>
            <ul className="space-y-2 text-muted-foreground">
              <li>• <strong>Account information</strong> - Email, shop name, and contact details you provide.</li>
              <li>• <strong>Shop data</strong> - Work orders and business information you upload for AI lookups.</li>
              <li>• <strong>Call summaries</strong> - Structured data showing intent, outcome, and tools used.</li>
              <li>• <strong>Usage analytics</strong> - Aggregated data to improve our service.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Data Security</h2>
            <p className="text-muted-foreground">
              All data is encrypted in transit and at rest. We use industry-standard security 
              practices and regularly audit our systems.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Your Rights</h2>
            <p className="text-muted-foreground">
              You can request access to, correction of, or deletion of your data at any time. 
              Contact us at privacy@voiceai.com.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about this privacy policy, please contact us at{" "}
              <a href="mailto:privacy@voiceai.com" className="text-primary hover:underline">
                privacy@voiceai.com
              </a>.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
