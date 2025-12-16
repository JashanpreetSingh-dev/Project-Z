"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useAuth } from "@clerk/nextjs";
import {
  Loader2,
  Phone,
  CheckCircle,
  Clock,
  TrendingUp,
} from "lucide-react";
import { callsAPI, type CallAnalytics } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  VolumeChart,
  OutcomeChart,
  IntentChart,
  PeakHoursChart,
} from "@/components/dashboard/analytics";

type DateRange = 7 | 30 | 90;

function formatDuration(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);
  return `${minutes}m ${remainingSeconds}s`;
}

export default function AnalyticsPage() {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [analytics, setAnalytics] = useState<CallAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>(30);

  useEffect(() => {
    if (!isLoaded) return;

    if (!isSignedIn) {
      setIsLoading(false);
      return;
    }

    async function loadAnalytics() {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getToken();
        if (!token) {
          setError("Unable to get authentication token");
          return;
        }

        const data = await callsAPI.getAnalytics(token, dateRange);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load analytics");
      } finally {
        setIsLoading(false);
      }
    }

    loadAnalytics();
  }, [getToken, isLoaded, isSignedIn, dateRange]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading analytics...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Call Analytics</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Insights about your AI receptionist performance
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <span className="text-lg">⚠️</span>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header with date range selector */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            <span className="gradient-text">Call Analytics</span>
          </h1>
          <p className="mt-1 text-muted-foreground">
            Insights about your AI receptionist performance
          </p>
        </div>
        <div className="flex gap-2">
          {([7, 30, 90] as DateRange[]).map((days) => (
            <Button
              key={days}
              variant={dateRange === days ? "default" : "outline"}
              size="sm"
              onClick={() => setDateRange(days)}
            >
              {days}d
            </Button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Calls
            </CardTitle>
            <div className="rounded-lg bg-primary/10 p-2">
              <Phone className="h-4 w-4 text-primary" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics?.total_calls ?? 0}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Last {dateRange} days
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Resolution Rate
            </CardTitle>
            <div className="rounded-lg bg-green-500/10 p-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics?.resolution_rate?.toFixed(1) ?? 0}%
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Handled by AI
            </p>
          </CardContent>
        </Card>

        <Card className="hover-lift">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg Duration
            </CardTitle>
            <div className="rounded-lg bg-blue-500/10 p-2">
              <Clock className="h-4 w-4 text-blue-500" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {analytics?.avg_duration_seconds
                ? formatDuration(analytics.avg_duration_seconds)
                : "—"}
            </div>
            <p className="mt-1 text-sm text-muted-foreground">
              Per call
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Volume Chart */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary/10 p-2">
              <TrendingUp className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Call Volume</CardTitle>
              <CardDescription>Calls per day over the selected period</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {analytics?.calls_by_day && analytics.calls_by_day.length > 0 ? (
            <VolumeChart data={analytics.calls_by_day} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No call volume data available
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column row: Outcomes and Intents */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Call Outcomes</CardTitle>
            <CardDescription>How calls were resolved</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.outcomes && Object.keys(analytics.outcomes).length > 0 ? (
              <OutcomeChart data={analytics.outcomes} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No outcome data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Caller Intents</CardTitle>
            <CardDescription>What callers are asking about</CardDescription>
          </CardHeader>
          <CardContent>
            {analytics?.intents && Object.keys(analytics.intents).length > 0 ? (
              <IntentChart data={analytics.intents} />
            ) : (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground">
                No intent data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Peak Hours */}
      <Card>
        <CardHeader>
          <CardTitle>Peak Hours</CardTitle>
          <CardDescription>When your customers are calling</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics?.calls_by_hour && Object.keys(analytics.calls_by_hour).length > 0 ? (
            <PeakHoursChart data={analytics.calls_by_hour} />
          ) : (
            <div className="flex h-[300px] items-center justify-center text-muted-foreground">
              No peak hours data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

