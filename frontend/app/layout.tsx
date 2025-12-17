import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { ClerkProviderThemed } from "@/components/clerk-provider-themed";
import { Providers } from "@/components/providers";
import "./globals.css";

const inter = Inter({ 
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Voice Receptionist - AI Phone Assistant for Auto Shops",
  description: "AI-powered phone receptionist that handles customer calls, checks repair status, and provides business information 24/7.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} ${inter.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ClerkProviderThemed>
            <Providers>
              {children}
            </Providers>
          </ClerkProviderThemed>
        </ThemeProvider>
      </body>
    </html>
  );
}
