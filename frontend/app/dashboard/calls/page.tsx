"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
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
  const router = useRouter();
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
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Call History</h1>
        <p className="text-muted-foreground">
          View all calls handled by your AI receptionist
        </p>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-4 text-destructive">
          {error}
        </div>
      )}

      {calls.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <span className="text-4xl">📞</span>
            <CardTitle className="mt-4">No calls yet</CardTitle>
            <CardDescription className="mt-2">
              When your AI receptionist handles calls, they&apos;ll appear here.
            </CardDescription>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date/Time</TableHead>
                <TableHead>Caller</TableHead>
                <TableHead>Intent</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Duration</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {calls.map((call) => (
                <TableRow
                  key={call.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/dashboard/calls/${call.id}`)}
                >
                  <TableCell>{formatDateTime(call.timestamp)}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {call.caller_number || "Unknown"}
                  </TableCell>
                  <TableCell>
                    <IntentBadge intent={call.intent} />
                  </TableCell>
                  <TableCell>
                    <OutcomeBadge outcome={call.outcome} />
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {call.duration_seconds
                      ? formatDuration(call.duration_seconds)
                      : "-"}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );
}

function IntentBadge({ intent }: { intent: string }) {
  const variants: Record<string, "default" | "secondary" | "info" | "warning" | "success"> = {
    CHECK_STATUS: "info",
    GET_HOURS: "success",
    GET_LOCATION: "secondary",
    GET_SERVICES: "warning",
    TRANSFER_HUMAN: "default",
    UNKNOWN: "secondary",
  };

  return (
    <Badge variant={variants[intent] || "secondary"}>
      {intent.replace("_", " ")}
    </Badge>
  );
}

function OutcomeBadge({ outcome }: { outcome: string }) {
  const variants: Record<string, "default" | "secondary" | "info" | "warning" | "success" | "destructive"> = {
    RESOLVED: "success",
    TRANSFERRED: "info",
    ABANDONED: "secondary",
    FAILED: "destructive",
    TIMEOUT: "warning",
  };

  return (
    <Badge variant={variants[outcome] || "secondary"}>
      {outcome}
    </Badge>
  );
}
