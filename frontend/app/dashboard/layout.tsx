import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { Sidebar } from "@/components/dashboard/sidebar";

// Check if Clerk is configured (for CI builds without secrets)
const isClerkConfigured = !!process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Skip auth check when Clerk is not configured (CI builds)
  if (isClerkConfigured) {
    const { userId } = await auth();
    if (!userId) {
      redirect("/sign-in");
    }
  }

  return (
    <div className="flex h-screen bg-background">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        {/* Subtle gradient background */}
        <div className="fixed inset-0 -z-10 ml-64">
          <div className="absolute top-0 right-0 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        </div>
        <div className="container mx-auto p-8">{children}</div>
      </main>
    </div>
  );
}
