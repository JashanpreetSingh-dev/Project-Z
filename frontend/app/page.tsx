import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default async function HomePage() {
  const { userId } = await auth();

  if (userId) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <div className="text-2xl font-bold">Voice Receptionist</div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-up">Get Started</Link>
            </Button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="container mx-auto px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-5xl font-bold tracking-tight">
            AI-Powered Phone Receptionist for{" "}
            <span className="text-primary">Auto Shops</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground">
            Never miss a customer call again. Our AI receptionist handles
            inquiries about repair status, business hours, and services 24/7.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/sign-up">Start Free Trial</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="#features">Learn More</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <section id="features" className="mt-32">
          <h2 className="text-center text-3xl font-bold">
            What Your AI Receptionist Can Do
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="text-4xl">🔧</div>
                <CardTitle className="mt-4">Check Repair Status</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Customers can call to check on their vehicle repairs. The AI
                  looks up their work order and provides real-time updates.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl">🕐</div>
                <CardTitle className="mt-4">Business Hours & Location</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Automatically answers questions about your shop&apos;s hours,
                  location, and directions - even after hours.
                </CardDescription>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-4xl">📋</div>
                <CardTitle className="mt-4">Service Information</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Lists available services and can transfer calls to a human
                  when customers need more detailed assistance.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>&copy; 2024 Voice Receptionist. Built for auto shops.</p>
        </div>
      </footer>
    </div>
  );
}
