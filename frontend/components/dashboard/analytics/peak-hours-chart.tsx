"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartConfig = {
  count: {
    label: "Calls",
    color: "hsl(var(--primary))",
  },
} satisfies ChartConfig;

interface PeakHoursChartProps {
  data: Record<string, number>;
}

function formatHour(hour: number): string {
  if (hour === 0) return "12 AM";
  if (hour === 12) return "12 PM";
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function PeakHoursChart({ data }: PeakHoursChartProps) {
  // Create full 24-hour dataset (fill missing hours with 0)
  const chartData = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    label: formatHour(hour),
    count: data[String(hour)] || 0,
  }));

  // Check if there's any data
  const hasData = chartData.some((item) => item.count > 0);

  if (!hasData) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No peak hours data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={10}
          interval={2} // Show every 3rd label to avoid crowding
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          fontSize={12}
          allowDecimals={false}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--muted))", opacity: 0.3 }}
          content={<ChartTooltipContent />}
        />
        <Bar
          dataKey="count"
          fill="var(--color-count)"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ChartContainer>
  );
}
