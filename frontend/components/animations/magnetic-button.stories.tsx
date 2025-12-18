import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MagneticButton } from "./magnetic-button";
import { Button } from "../ui/button";

const meta = {
  title: "Animations/MagneticButton",
  component: MagneticButton,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    strength: {
      control: { type: "range", min: 0, max: 1, step: 0.1 },
    },
    radius: {
      control: { type: "number", min: 50, max: 300, step: 10 },
    },
  },
} as Meta<typeof MagneticButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <MagneticButton>
      <Button>Hover me (Magnetic Effect)</Button>
    </MagneticButton>
  ),
};

export const StrongMagnetic: Story = {
  render: () => (
    <MagneticButton strength={0.5}>
      <Button>Strong Magnetic Effect</Button>
    </MagneticButton>
  ),
};

export const WeakMagnetic: Story = {
  render: () => (
    <MagneticButton strength={0.1}>
      <Button>Weak Magnetic Effect</Button>
    </MagneticButton>
  ),
};

export const LargeRadius: Story = {
  render: () => (
    <MagneticButton radius={200}>
      <Button>Large Magnetic Radius</Button>
    </MagneticButton>
  ),
};

// HoverScaleExample and GlowButtonExample stories removed - HoverScale and GlowButtonWrapper are not exported

export const AllEffects: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <MagneticButton>
        <Button>Magnetic Effect</Button>
      </MagneticButton>
    </div>
  ),
};
