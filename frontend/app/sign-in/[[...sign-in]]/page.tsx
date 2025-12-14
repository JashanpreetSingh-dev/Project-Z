import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background relative">
      {/* Gradient background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-[hsl(262,83%,58%)] to-transparent opacity-10 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-[hsl(199,89%,48%)] to-transparent opacity-10 blur-3xl" />
      </div>
      
      <SignIn
        appearance={{
          elements: {
            rootBox: "relative z-10",
          },
        }}
      />
    </div>
  );
}
