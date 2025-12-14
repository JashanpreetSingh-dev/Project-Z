"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Headphones, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioPlayer } from "@/components/demo/audio-player";
import { ChatSimulator } from "@/components/demo/chat-simulator";

type TabType = "audio" | "interactive";

export default function DemoPage() {
  const [activeTab, setActiveTab] = useState<TabType>("interactive");

  return (
    <>
      {/* Hero */}
      <section className="container mx-auto px-4 py-24">
        <div className="mx-auto max-w-3xl text-center animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Experience{" "}
            <span className="gradient-text">Voice AI</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            See how our AI receptionist handles real customer calls. Try the interactive
            demo or listen to sample conversations.
          </p>
        </div>
      </section>

      {/* Demo Section */}
      <section className="pb-24">
        <div className="container mx-auto px-4">
          {/* Tab Navigation */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex rounded-xl border bg-muted/50 p-1">
              <button
                onClick={() => setActiveTab("interactive")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "interactive"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <MessageSquare className="h-4 w-4" />
                Interactive Demo
              </button>
              <button
                onClick={() => setActiveTab("audio")}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                  activeTab === "audio"
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Headphones className="h-4 w-4" />
                Audio Samples
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="animate-fade-in">
            {activeTab === "interactive" ? (
              <ChatSimulator />
            ) : (
              <div className="max-w-4xl mx-auto">
                <AudioPlayer />
              </div>
            )}
          </div>
        </div>
      </section>

      {/* What You're Seeing */}
      <section className="border-t bg-muted/30 py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <h2 className="text-3xl font-bold sm:text-4xl">
              What You&apos;re Experiencing
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              This demo showcases how Voice AI handles common auto shop calls.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
              <h3 className="font-semibold">Real Scenarios</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                These conversations mirror actual calls our AI handles daily.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <span className="text-2xl">🔍</span>
              </div>
              <h3 className="font-semibold">Data Lookups</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                The AI accesses real shop data to provide accurate responses.
              </p>
            </div>

            <div className="rounded-2xl border bg-card p-6 text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center">
                <span className="text-2xl">🔄</span>
              </div>
              <h3 className="font-semibold">Smart Fallbacks</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Complex questions get transferred to your team with context.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real Voice Note */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-8 md:p-12 text-center">
            <h2 className="text-2xl font-bold sm:text-3xl">
              Ready for the Real Thing?
            </h2>
            <p className="mt-4 text-muted-foreground">
              This demo uses text-based simulation. The actual Voice AI uses natural
              speech—customers call your number and have real conversations with the AI.
              It sounds like this demo, but through a phone call.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="gradient-bg border-0 glow" asChild>
                <Link href="/sign-up">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/contact">Schedule a Live Demo</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
