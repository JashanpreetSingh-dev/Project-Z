"use client";

// Force dynamic rendering to prevent static generation with Clerk hooks
export const dynamic = "force-dynamic";

import { useParams, useRouter } from "next/navigation";
import { Loader2, Phone, MessageSquare, User, ArrowLeft } from "lucide-react";
import { type CallLog } from "@/lib/api";
import { useCall } from "@/hooks/calls/use-call";
import { useCustomerContext } from "@/hooks/context/use-customer-context";
import { formatDateTime, formatDuration, formatPhoneDisplay, formatRelativeTime } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function CallDetailPage() {
  const params = useParams();
  const router = useRouter();
  const callId = params.callId as string;

  const { data: call, isLoading, error } = useCall(callId);
  const { data: customerContext, isLoading: isLoadingContext } = useCustomerContext(call?.caller_number ?? null);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Loading call details...</span>
        </div>
      </div>
    );
  }

  if (error || !call) {
    return (
      <div className="space-y-4">
        <Button
          variant="ghost"
          onClick={() => router.push("/dashboard/calls")}
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Calls
        </Button>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-destructive mb-2">⚠️</div>
            <CardTitle className="text-lg">Call not found</CardTitle>
            <CardDescription className="mt-2">
              {error instanceof Error ? error.message : "The call you're looking for doesn't exist or you don't have access to it."}
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Filter and sort interactions
  const callTimestamp = new Date(call.timestamp).getTime();
  let filteredInteractions = customerContext?.interactions.filter((interaction: { timestamp?: string | null }) => {
    if (!interaction.timestamp) return false;
    const interactionTime = new Date(interaction.timestamp).getTime();
    return interactionTime <= callTimestamp;
  }) || [];

  // Sort interactions newest first (reverse chronological)
  filteredInteractions = [...filteredInteractions].sort((a, b) => {
    const timeA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
    const timeB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
    return timeB - timeA; // Newest first
  });

  return (
    <div className="overflow-hidden flex flex-col animate-fade-in -m-8" style={{ height: '100vh', maxHeight: '100vh' }}>
      {/* Header with Back Button - Sticky */}
      <div className="sticky top-0 z-20 bg-background flex-shrink-0 px-6 pt-6 pb-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/dashboard/calls")}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Calls</span>
            </Button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold tracking-tight">
                <span className="gradient-text">Call Details</span>
              </h1>
              <p className="mt-1 text-xs md:text-sm text-muted-foreground">
                {formatDateTime(call.timestamp)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area - Non-scrollable */}
      <div className="flex-1 flex flex-col overflow-hidden px-6 py-6 min-h-0" style={{ paddingLeft: '2rem', paddingRight: '2rem', paddingTop: '1.5rem', paddingBottom: '1.5rem' }}>
        <div className="max-w-7xl mx-auto h-full flex flex-col min-h-0 w-full overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 h-full min-h-0 overflow-hidden">
            {/* Left Column - Call Information & Customer Info */}
            <div className="flex flex-col gap-4 md:gap-6 min-h-0 h-full overflow-hidden">
              {/* Call Information Card */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm md:text-base">Call Information</CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Caller</div>
                      <p className="text-sm font-medium">
                        {call.caller_number ? formatPhoneDisplay(call.caller_number) : "Unknown"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Duration</div>
                      <p className="text-sm">
                        {call.duration_seconds ? formatDuration(call.duration_seconds) : "-"}
                      </p>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Intent</div>
                      <IntentBadge intent={call.intent} />
                    </div>
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">Outcome</div>
                      <OutcomeBadge outcome={call.outcome} />
                    </div>
                    {call.call_sid && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Call SID</div>
                        <p className="text-sm font-mono text-xs">{call.call_sid}</p>
                      </div>
                    )}
                    {call.work_order_id && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-1">Work Order</div>
                        <p className="text-sm">{call.work_order_id}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Customer Info */}
              {call.caller_number && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm md:text-base">Customer Info</CardTitle>
                    <CardDescription className="text-xs">
                      {call.caller_number ? formatPhoneDisplay(call.caller_number) : "Unknown"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {isLoadingContext ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                      </div>
                    ) : customerContext ? (
                      <div className="space-y-3">
                        {customerContext.known_info.name && (
                          <div>
                            <div className="flex items-center gap-2 text-xs font-medium mb-1.5 text-muted-foreground">
                              <User className="h-3.5 w-3.5 md:h-4 md:w-4" />
                              Name
                            </div>
                            <p className="text-sm font-medium">
                              {customerContext.known_info.name}
                            </p>
                          </div>
                        )}

                        {customerContext.known_info.vehicles &&
                          customerContext.known_info.vehicles.length > 0 && (
                            <div>
                              <div className="text-xs font-medium mb-1.5 text-muted-foreground">
                                Vehicles
                              </div>
                              <div className="space-y-1">
                                {customerContext.known_info.vehicles.map((vehicle: { make?: string; model?: string; year?: number }, idx: number) => (
                                  <p key={idx} className="text-sm">
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                  </p>
                                ))}
                              </div>
                            </div>
                          )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground text-center py-8">
                        No customer context available
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Right Column - Interaction History */}
            {call.caller_number && (
              <Card className="flex flex-col min-h-0 h-full overflow-hidden">
                <CardHeader className="flex-shrink-0">
                  <CardTitle className="text-sm md:text-base">Interaction History</CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col min-h-0 pt-0 overflow-hidden">
                  {isLoadingContext ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                  ) : customerContext ? (
                    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                      {filteredInteractions.length === 0 ? (
                        <p className="text-sm text-muted-foreground text-center py-8">No interactions yet</p>
                      ) : (
                        <div className="flex-1 overflow-y-auto min-h-0">
                          <div className="relative pr-2">
                            {/* Timeline line */}
                            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
                            
                            {/* Timeline items */}
                            <div className="space-y-4 pb-4">
                              {filteredInteractions.map((interaction: { channel: "voice" | "sms"; timestamp?: string | null; intent?: string | null; summary?: string | null; outcome?: string | null }, idx: number) => {
                                const isCall = interaction.channel === "voice";
                                return (
                                  <div key={idx} className="relative flex gap-3 md:gap-4">
                                    {/* Timeline icon */}
                                    <div className={`relative z-10 flex h-7 w-7 md:h-8 md:w-8 items-center justify-center rounded-full flex-shrink-0 ${
                                      isCall 
                                        ? "bg-primary text-primary-foreground" 
                                        : "bg-secondary text-secondary-foreground"
                                    }`}>
                                      {isCall ? (
                                        <Phone className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                      ) : (
                                        <MessageSquare className="h-3.5 w-3.5 md:h-4 md:w-4" />
                                      )}
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-1 space-y-1.5 pb-1 min-w-0">
                                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-2">
                                        <div className="flex items-center gap-2 flex-wrap">
                                          <Badge
                                            variant={isCall ? "default" : "secondary"}
                                            className="text-xs"
                                          >
                                            {isCall ? "Call" : "SMS"}
                                          </Badge>
                                          {interaction.intent && (
                                            <span className="text-xs text-muted-foreground">
                                              {interaction.intent.replace("_", " ")}
                                            </span>
                                          )}
                                        </div>
                                        <div className="text-left sm:text-right">
                                          <div className="text-xs font-medium">
                                            {interaction.timestamp && formatRelativeTime(interaction.timestamp)}
                                          </div>
                                          <div className="text-[10px] text-muted-foreground">
                                            {interaction.timestamp && formatDateTime(interaction.timestamp)}
                                          </div>
                                        </div>
                                      </div>
                                      {interaction.summary && (
                                        <p className="text-sm leading-relaxed break-words">{interaction.summary}</p>
                                      )}
                                      {interaction.outcome && (
                                        <div>
                                          <OutcomeBadge outcome={interaction.outcome} />
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-8">
                      No customer context available
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
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

