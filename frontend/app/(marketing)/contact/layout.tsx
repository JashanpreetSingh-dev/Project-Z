import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Akseli",
  description: "Get in touch with Akseli. Have questions about our AI phone receptionist? We'd love to hear from you.",
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
