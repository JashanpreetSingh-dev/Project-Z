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
