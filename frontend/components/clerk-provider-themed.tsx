"use client";

import { ClerkProvider } from "@clerk/nextjs";

const clerkAppearance = {
  variables: {
    colorPrimary: "hsl(262, 83%, 58%)",
    borderRadius: "0.75rem",
    fontFamily: "var(--font-inter), system-ui, sans-serif",
  },
  elements: {
    rootBox: "font-sans",
    card: "bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl shadow-primary/5",
    headerTitle: "text-foreground font-bold",
    headerSubtitle: "text-muted-foreground",
    socialButtonsBlockButton: 
      "bg-secondary hover:bg-secondary/80 border border-border text-foreground transition-all duration-200",
    socialButtonsBlockButtonText: "text-foreground font-medium",
    dividerLine: "bg-border",
    dividerText: "text-muted-foreground",
    formFieldLabel: "text-foreground font-medium",
    formFieldInput: 
      "bg-background border-input focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200",
    formButtonPrimary:
      "bg-gradient-to-r from-[hsl(262,83%,58%)] to-[hsl(199,89%,48%)] hover:opacity-90 text-white font-medium shadow-lg shadow-primary/25 transition-all duration-200 normal-case",
    footerActionLink: "text-primary hover:text-primary/80 font-medium",
    identityPreviewEditButton: "text-primary hover:text-primary/80",
    formFieldAction: "text-primary hover:text-primary/80",
    userButtonPopoverCard: "bg-card border border-border shadow-xl backdrop-blur-xl",
    userButtonPopoverActionButton: "hover:bg-muted transition-colors",
    userButtonPopoverActionButtonText: "text-foreground",
    userButtonPopoverActionButtonIcon: "text-muted-foreground",
    userButtonPopoverFooter: "hidden",
    userPreviewMainIdentifier: "text-foreground font-medium",
    userPreviewSecondaryIdentifier: "text-muted-foreground",
    avatarBox: "ring-2 ring-primary/20",
    profileSectionPrimaryButton: "text-primary hover:text-primary/80",
    formResendCodeLink: "text-primary hover:text-primary/80",
    navbar: "bg-card border-r border-border",
    navbarButton: "text-foreground hover:bg-muted",
    pageScrollBox: "bg-background",
    page: "bg-background",
    modalContent: "bg-card border border-border",
    modalBackdrop: "backdrop-blur-sm",
    alertText: "text-destructive",
    formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
    otpCodeFieldInput: "border-input bg-background text-foreground",
    selectButton: "bg-background border-input text-foreground",
    selectOptionsContainer: "bg-card border border-border",
    selectOption: "hover:bg-muted text-foreground",
    badge: "bg-primary/10 text-primary",
    menuButton: "hover:bg-muted",
    menuList: "bg-card border border-border shadow-lg",
    menuItem: "hover:bg-muted text-foreground",
  },
};

export function ClerkProviderThemed({ children }: { children: React.ReactNode }) {
  return (
    <ClerkProvider appearance={clerkAppearance}>
      {children}
    </ClerkProvider>
  );
}
