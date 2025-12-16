import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { ThemeToggle } from "./theme-toggle";

const meta = {
  title: "Components/ThemeToggle",
  component: ThemeToggle,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
} as Meta<typeof ThemeToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => <ThemeToggle />,
};

export const WithLabel: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <ThemeToggle />
      <span className="text-sm text-muted-foreground">Toggle theme</span>
    </div>
  ),
};

export const Multiple: Story = {
  render: () => (
    <div className="flex gap-4">
      <ThemeToggle />
      <ThemeToggle />
      <ThemeToggle />
    </div>
  ),
};
