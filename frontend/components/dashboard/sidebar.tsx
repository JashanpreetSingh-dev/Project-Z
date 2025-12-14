"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: "📊",
  },
  {
    href: "/dashboard/calls",
    label: "Call History",
    icon: "📞",
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: "⚙️",
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center px-6">
        <Link href="/dashboard" className="text-xl font-bold">
          Voice Receptionist
        </Link>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Button
              key={item.href}
              variant={isActive ? "secondary" : "ghost"}
              className={cn("w-full justify-start gap-3")}
              asChild
            >
              <Link href={item.href}>
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <Separator />

      {/* User Section */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <span className="text-sm text-muted-foreground">Account</span>
        </div>
      </div>
    </aside>
  );
}
