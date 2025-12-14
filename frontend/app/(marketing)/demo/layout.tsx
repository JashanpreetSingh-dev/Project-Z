import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Demo - Voice AI",
  description: "Try Voice AI's interactive demo. Experience how our AI receptionist handles customer calls for auto shops.",
};

export default function DemoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
