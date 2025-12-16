"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const INTENT_LABELS: Record<string, string> = {
  CHECK_STATUS: "Check Status",
  GET_HOURS: "Get Hours",
  GET_LOCATION: "Get Location",
  GET_SERVICES: "Get Services",
  TRANSFER_HUMAN: "Transfer",
  UNKNOWN: "Unknown",
};

const chartConfig = {
  count: {
    label: "Calls",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface IntentChartProps {
  data: Record<string, number>;
}

export function IntentChart({ data }: IntentChartProps) {
  // Transform and sort data for bar chart (highest first)
  const chartData = Object.entries(data)
    .map(([intent, count]) => ({
      intent,
      label: INTENT_LABELS[intent] || intent,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No intent data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        layout="vertical"
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" horizontal={false} />
        <XAxis
          type="number"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          allowDecimals={false}
        />
        <YAxis
          type="category"
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          width={100}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[0, 4, 4, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}

