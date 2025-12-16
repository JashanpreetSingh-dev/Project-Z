"use client";

import { Cell, Pie, PieChart } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from "@/components/ui/chart";

const OUTCOME_COLORS: Record<string, string> = {
  RESOLVED: "hsl(142, 76%, 36%)", // green
  TRANSFERRED: "hsl(217, 91%, 60%)", // blue
  ABANDONED: "hsl(220, 9%, 46%)", // gray
  FAILED: "hsl(0, 84%, 60%)", // red
  TIMEOUT: "hsl(45, 93%, 47%)", // yellow
};

const OUTCOME_LABELS: Record<string, string> = {
  RESOLVED: "Resolved",
  TRANSFERRED: "Transferred",
  ABANDONED: "Abandoned",
  FAILED: "Failed",
  TIMEOUT: "Timeout",
};

interface OutcomeChartProps {
  data: Record<string, number>;
}

export function OutcomeChart({ data }: OutcomeChartProps) {
  // Transform data for pie chart
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
    fill: OUTCOME_COLORS[name] || "hsl(var(--muted))",
  }));

  // Build chart config dynamically
  const chartConfig: ChartConfig = Object.fromEntries(
    Object.entries(data).map(([key]) => [
      key,
      {
        label: OUTCOME_LABELS[key] || key,
        color: OUTCOME_COLORS[key] || "hsl(var(--muted))",
      },
    ])
  );

  if (chartData.length === 0) {
    return (
      <div className="flex h-[300px] items-center justify-center text-muted-foreground">
        No outcome data available
      </div>
    );
  }

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <PieChart>
        <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
        >
          {chartData.map((entry) => (
            <Cell key={entry.name} fill={entry.fill} />
          ))}
        </Pie>
        <ChartLegend content={<ChartLegendContent nameKey="name" />} />
      </PieChart>
    </ChartContainer>
  );
}



