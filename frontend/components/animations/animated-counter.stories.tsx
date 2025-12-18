import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AnimatedCounter } from "./animated-counter";

const meta = {
  title: "Animations/AnimatedCounter",
  component: AnimatedCounter,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    value: {
      control: "number",
    },
    prefix: {
      control: "text",
    },
    suffix: {
      control: "text",
    },
    duration: {
      control: "number",
    },
  },
} as Meta<typeof AnimatedCounter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    value: 1000,
  },
};

export const WithPrefix: Story = {
  args: {
    value: 500,
    prefix: "$",
  },
};

export const WithSuffix: Story = {
  args: {
    value: 95,
    suffix: "%",
  },
};

export const WithPrefixAndSuffix: Story = {
  args: {
    value: 42,
    prefix: "$",
    suffix: ".00",
  },
};

export const LargeNumber: Story = {
  args: {
    value: 1234567,
    prefix: "",
  },
};

export const FastAnimation: Story = {
  args: {
    value: 1000,
    duration: 0.5,
  },
};

export const SlowAnimation: Story = {
  args: {
    value: 1000,
    duration: 3,
  },
};

export const AllExamples: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <div className="text-center">
        <div className="text-4xl font-bold">
          <AnimatedCounter value={1234} />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Default counter</p>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold">
          <AnimatedCounter value={500} prefix="$" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">With prefix</p>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold">
          <AnimatedCounter value={95} suffix="%" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">With suffix</p>
      </div>
      <div className="text-center">
        <div className="text-4xl font-bold">
          <AnimatedCounter value={42} prefix="$" suffix=".00" />
        </div>
        <p className="text-sm text-muted-foreground mt-2">Price format</p>
      </div>
    </div>
  ),
};
