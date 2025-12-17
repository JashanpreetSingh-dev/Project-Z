"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Loader2, PhoneIncoming } from "lucide-react";
import { type CallLog } from "@/lib/api";
import { useCalls } from "@/hooks/calls/use-calls";
import { formatDateTime, formatDuration, formatPhoneDisplay } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function CallsPage() {
  const router = useRouter();
  const { data: calls = [], isLoading, error } = useCalls();
  // Infinite scroll pagination
  const [displayedCalls, setDisplayedCalls] = useState<CallLog[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const CALLS_PER_LOAD = 20;
  const observerTarget = useRef<HTMLDivElement>(null);

  // Initialize displayed calls when data loads
  useEffect(() => {
    if (calls.length > 0 && displayedCalls.length === 0) {
      setDisplayedCalls(calls.slice(0, CALLS_PER_LOAD));
    }
  }, [calls, displayedCalls.length]);

  // Load more calls for infinite scroll
  const loadMoreCalls = useCallback(() => {
    if (isLoadingMore || displayedCalls.length >= calls.length) return;
    
    setIsLoadingMore(true);
    // Simulate slight delay for better UX
    setTimeout(() => {
      const nextBatch = calls.slice(displayedCalls.length, displayedCalls.length + CALLS_PER_LOAD);
      setDisplayedCalls((prev) => [...prev, ...nextBatch]);
      setIsLoadingMore(false);
    }, 100);
  }, [calls, displayedCalls.length, isLoadingMore]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoadingMore && displayedCalls.length < calls.length) {
          loadMoreCalls();
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [loadMoreCalls, isLoadingMore, displayedCalls.length, calls.length]);

  const handleCallClick = (call: CallLog) => {
    router.push(`/dashboard/calls/${call.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading call history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden flex flex-col animate-fade-in -m-8" style={{ height: '100vh', maxHeight: '100vh' }}>
      {/* Header - Sticky */}
      <div className="sticky top-0 z-20 bg-background flex-shrink-0 px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              <span className="gradient-text">Call History</span>
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {calls.length} {calls.length === 1 ? "call" : "calls"} total
            </p>
          </div>
        </div>
      </div>

      {/* Content Area - Scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>

        {error && (
          <div className="flex items-center gap-3 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive mb-4">
            <span>⚠️</span>
            <p>{error instanceof Error ? error.message : "Failed to load calls"}</p>
          </div>
        )}

        {calls.length === 0 ? (
          <Card className="flex-1 flex items-center justify-center">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <div className="rounded-xl bg-primary/10 p-4">
                <PhoneIncoming className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="mt-4 text-lg">No calls yet</CardTitle>
              <CardDescription className="mt-1 text-center max-w-sm text-sm">
                When your AI receptionist handles calls, they&apos;ll appear here.
              </CardDescription>
            </CardContent>
          </Card>
        ) : (
          <Card className="flex-1 flex flex-col min-h-0 overflow-hidden">
            <CardContent className="flex-1 flex flex-col min-h-0 p-0 overflow-hidden">
              <div className="flex-1 overflow-y-auto min-h-0">
                <Table noScrollWrapper>
                  <TableHeader className="sticky top-0 bg-background z-10 border-b shadow-sm backdrop-blur-sm">
                    <TableRow className="hover:bg-transparent">
                      <TableHead className="pl-4">Time</TableHead>
                      <TableHead>Caller</TableHead>
                      <TableHead>Intent</TableHead>
                      <TableHead>Outcome</TableHead>
                      <TableHead className="pr-4">Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedCalls.map((call, index) => (
                      <TableRow
                        key={call.id}
                        className="cursor-pointer"
                        style={{ animationDelay: `${index * 30}ms` }}
                        onClick={() => handleCallClick(call)}
                      >
                        <TableCell className="pl-4 text-sm">
                          {formatDateTime(call.timestamp)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {call.caller_number ? formatPhoneDisplay(call.caller_number) : "Unknown"}
                        </TableCell>
                        <TableCell>
                          <IntentBadge intent={call.intent} />
                        </TableCell>
                        <TableCell>
                          <OutcomeBadge outcome={call.outcome} />
                        </TableCell>
                        <TableCell className="pr-4 text-sm text-muted-foreground">
                          {call.duration_seconds
                            ? formatDuration(call.duration_seconds)
                            : "-"}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {/* Infinite scroll trigger */}
                {displayedCalls.length < calls.length && (
                  <div ref={observerTarget} className="flex items-center justify-center py-4">
                    {isLoadingMore && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Loading more calls...</span>
                      </div>
                    )}
                  </div>
                )}
                {displayedCalls.length >= calls.length && displayedCalls.length > 0 && (
                  <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
                    All calls loaded
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
    CHECK_STATUS: { variant: "default", label: "Status" },
    GET_HOURS: { variant: "secondary", label: "Hours" },
    GET_LOCATION: { variant: "outline", label: "Location" },
    GET_SERVICES: { variant: "secondary", label: "Services" },
    TRANSFER_HUMAN: { variant: "outline", label: "Transfer" },
    UNKNOWN: { variant: "outline", label: "Unknown" },
  };

  const { variant, label } = config[intent] || { variant: "outline", label: intent };

  return (
    <Badge variant={variant} className="font-normal text-xs">
      {label}
    </Badge>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const config: Record<string, { className: string; label: string }> = {
    RESOLVED: {
      className: "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20",
      label: "Resolved",
    },
    TRANSFERRED: {
      className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
      label: "Transferred",
    },
    ABANDONED: {
      className: "bg-muted text-muted-foreground",
      label: "Abandoned",
    },
    FAILED: {
      className: "bg-destructive/10 text-destructive border-destructive/20",
      label: "Failed",
    },
    TIMEOUT: {
      className: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400 border-yellow-500/20",
      label: "Timeout",
    },
  };

  const { className, label } = config[outcome] || { className: "", label: outcome };

  return (
    <Badge variant="outline" className={`${className} text-xs`}>
      {label}
    </Badge>
  );
}
