import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp
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
