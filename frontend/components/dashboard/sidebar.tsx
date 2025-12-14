"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";
import { LayoutDashboard, Phone, Settings, Zap, LogOut, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navItems = [
  {
    href: "/dashboard",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/calls",
    label: "Call History",
    icon: Phone,
  },
  {
    href: "/dashboard/settings",
    label: "Settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.firstName || user?.emailAddresses?.[0]?.emailAddress?.split("@")[0] || "User";
  const email = user?.emailAddresses?.[0]?.emailAddress || "";

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-card/50 backdrop-blur-xl">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg gradient-bg">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <Link href="/dashboard" className="text-lg font-bold">
          Voice AI
        </Link>
      </div>

      <Separator className="opacity-50" />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Button
              key={item.href}
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 transition-all duration-200",
                isActive && "bg-primary/10 text-primary hover:bg-primary/15"
              )}
              asChild
            >
              <Link href={item.href}>
                <Icon className={cn("h-4 w-4", isActive && "text-primary")} />
                {item.label}
              </Link>
            </Button>
          );
        })}
      </nav>

      <Separator className="opacity-50" />

      {/* Bottom Section */}
      <div className="p-4 space-y-3">
        {/* Theme Toggle */}
        <div className="flex items-center justify-between px-2">
          <span className="text-sm text-muted-foreground">Theme</span>
          <ThemeToggle />
        </div>

        <Separator className="opacity-50" />

        {/* User Section with Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="w-full justify-start gap-3 px-2 h-auto py-3 hover:bg-muted/50"
            >
              {/* Avatar */}
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary font-medium text-sm">
                {displayName.charAt(0).toUpperCase()}
              </div>
              
              {/* User Info */}
              <div className="flex flex-1 flex-col items-start text-left overflow-hidden">
                <span className="text-sm font-medium truncate w-full">
                  {displayName}
                </span>
                <span className="text-xs text-muted-foreground truncate w-full">
                  {email}
                </span>
              </div>
              
              <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
            </Button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent align="start" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{displayName}</p>
              <p className="text-xs text-muted-foreground">{email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings" className="cursor-pointer">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive focus:text-destructive cursor-pointer"
              onClick={() => signOut({ redirectUrl: "/" })}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
