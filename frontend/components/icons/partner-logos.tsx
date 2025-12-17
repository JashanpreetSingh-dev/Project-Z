import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function OpenAILogo({ className }: LogoProps) {
  return (
    <svg
      className={cn("h-6", className)}
      viewBox="0 0 120 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* OpenAI wordmark */}
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
        fill="currentColor"
      />
      <path
        d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"
        fill="currentColor"
      />
      <text
        x="28"
        y="17"
        fill="currentColor"
        fontSize="14"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        OpenAI
      </text>
    </svg>
  );
}

export function TwilioLogo({ className }: LogoProps) {
  return (
    <svg
      className={cn("h-6", className)}
      viewBox="0 0 100 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Twilio dot pattern */}
      <circle cx="8" cy="8" r="3" fill="#F22F46" />
      <circle cx="16" cy="8" r="3" fill="#F22F46" />
      <circle cx="8" cy="16" r="3" fill="#F22F46" />
      <circle cx="16" cy="16" r="3" fill="#F22F46" />
      <text
        x="28"
        y="17"
        fill="currentColor"
        fontSize="14"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Twilio
      </text>
    </svg>
  );
}

export function TekmetricLogo({ className }: LogoProps) {
  return (
    <svg
      className={cn("h-8", className)}
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Tekmetric stylized T */}
      <rect x="4" y="4" width="24" height="6" rx="2" fill="#2563EB" />
      <rect x="12" y="4" width="6" height="24" rx="2" fill="#2563EB" />
      <text
        x="36"
        y="22"
        fill="currentColor"
        fontSize="16"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Tekmetric
      </text>
    </svg>
  );
}

export function ShopWareLogo({ className }: LogoProps) {
  return (
    <svg
      className={cn("h-8", className)}
      viewBox="0 0 140 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Shop-Ware stylized S/W */}
      <path
        d="M8 8C8 5.79 9.79 4 12 4h8c2.21 0 4 1.79 4 4v2c0 2.21-1.79 4-4 4h-8c-2.21 0-4 1.79-4 4v2c0 2.21 1.79 4 4 4h8c2.21 0 4-1.79 4-4"
        stroke="#10B981"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <text
        x="36"
        y="22"
        fill="currentColor"
        fontSize="16"
        fontWeight="600"
        fontFamily="system-ui, -apple-system, sans-serif"
      >
        Shop-Ware
      </text>
    </svg>
  );
}

export function GoogleCalendarLogo({ className }: LogoProps) {
  return (
    <svg
      className={cn("h-5 w-5", className)}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Google Calendar icon - official colors */}
      <path
        d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"
        fill="#4285F4"
      />
      <path
        d="M7 13h2v2H7v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2z"
        fill="#34A853"
      />
      <path
        d="M7 16h2v2H7v-2zm4 0h2v2h-2v-2z"
        fill="#FBBC04"
      />
    </svg>
  );
}

// Index component for displaying logos in a grid
export function PartnerLogos({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center gap-12", className)}>
      <OpenAILogo className="h-6 text-muted-foreground hover:text-foreground transition-colors" />
      <TwilioLogo className="h-6 text-muted-foreground hover:text-foreground transition-colors" />
    </div>
  );
}

export function IntegrationLogos({ className }: LogoProps) {
  return (
    <div className={cn("flex items-center justify-center gap-12", className)}>
      <TekmetricLogo className="h-8 text-muted-foreground hover:text-foreground transition-colors" />
      <ShopWareLogo className="h-8 text-muted-foreground hover:text-foreground transition-colors" />
    </div>
  );
}
