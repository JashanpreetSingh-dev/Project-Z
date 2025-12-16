import { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "./chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

const meta = {
  title: "UI/Chart",
  component: ChartContainer,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 273, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

export const AreaChartExample: Story = {
  render: () => (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
        <AreaChart
          data={chartData}
          margin={{
            left: 12,
            right: 12,
            top: 12,
            bottom: 12,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="month"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          <YAxis hide />
          <ChartTooltip content={<ChartTooltipContent />} />
        <Area
          dataKey="mobile"
          type="natural"
          fill="var(--color-mobile)"
          fillOpacity={0.4}
          stroke="var(--color-mobile)"
          stackId="a"
        />
        <Area
          dataKey="desktop"
          type="natural"
          fill="var(--color-desktop)"
          fillOpacity={0.4}
          stroke="var(--color-desktop)"
          stackId="a"
        />
      </AreaChart>
    </ChartContainer>
  ),
};

export const SimpleChart: Story = {
  render: () => {
    const simpleData = [
      { name: "Jan", value: 400 },
      { name: "Feb", value: 300 },
      { name: "Mar", value: 200 },
      { name: "Apr", value: 278 },
      { name: "May", value: 189 },
    ];

    const simpleConfig = {
      value: {
        label: "Value",
        color: "hsl(var(--primary))",
      },
    };

    return (
      <ChartContainer config={simpleConfig} className="h-[200px] w-full">
        <AreaChart data={simpleData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Area
            type="monotone"
            dataKey="value"
            stroke="var(--color-value)"
            fill="var(--color-value)"
            fillOpacity={0.6}
          />
        </AreaChart>
      </ChartContainer>
    );
  },
};
