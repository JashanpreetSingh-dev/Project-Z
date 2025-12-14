import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignIn
        appearance={{
          elements: {
            formButtonPrimary:
              "bg-slate-900 hover:bg-slate-800 text-sm normal-case",
            card: "shadow-lg",
          },
        }}
      />
    </div>
  );
}
