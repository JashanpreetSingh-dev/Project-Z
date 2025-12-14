"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import { Loader2, Phone, PhoneIncoming } from "lucide-react";
import { callsAPI, type CallLog } from "@/lib/api";
import { formatDateTime, formatDuration } from "@/lib/utils";
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
  const { getToken } = useAuth();
  const [calls, setCalls] = useState<CallLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadCalls() {
      try {
        const token = await getToken();
        if (!token) return;

        const callsData = await callsAPI.getMyCalls(token);
        setCalls(callsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load calls");
      } finally {
        setIsLoading(false);
      }
    }

    loadCalls();
  }, [getToken]);

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
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          <span className="gradient-text">Call History</span>
        </h1>
        <p className="mt-1 text-muted-foreground">
          View all calls handled by your AI receptionist
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
      )}

      {calls.length === 0 ? (
        <Card className="hover-lift">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="rounded-2xl bg-primary/10 p-6">
              <PhoneIncoming className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="mt-6">No calls yet</CardTitle>
            <CardDescription className="mt-2 text-center max-w-sm">
              When your AI receptionist handles calls, they&apos;ll appear here
              with full details and transcripts.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-primary/10 p-2">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle>Recent Calls</CardTitle>
                  <CardDescription>{calls.length} calls total</CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6">Date/Time</TableHead>
                  <TableHead>Caller</TableHead>
                  <TableHead>Intent</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead className="pr-6">Duration</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {calls.map((call, index) => (
                  <TableRow
                    key={call.id}
                    className="cursor-pointer transition-colors"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell className="pl-6 font-medium">
                      {formatDateTime(call.timestamp)}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {call.caller_number || "Unknown"}
                    </TableCell>
                    <TableCell>
                      <IntentBadge intent={call.intent} />
                    </TableCell>
                    <TableCell>
                      <OutcomeBadge outcome={call.outcome} />
                    </TableCell>
                    <TableCell className="pr-6 text-muted-foreground">
                      {call.duration_seconds
                        ? formatDuration(call.duration_seconds)
                        : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const config: Record<string, { variant: "default" | "secondary" | "outline"; label: string }> = {
    CHECK_STATUS: { variant: "default", label: "Check Status" },
    GET_HOURS: { variant: "secondary", label: "Hours" },
    GET_LOCATION: { variant: "outline", label: "Location" },
    GET_SERVICES: { variant: "secondary", label: "Services" },
    TRANSFER_HUMAN: { variant: "outline", label: "Transfer" },
    UNKNOWN: { variant: "outline", label: "Unknown" },
  };

  const { variant, label } = config[intent] || { variant: "outline", label: intent };

  return (
    <Badge variant={variant} className="font-normal">
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
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
}
