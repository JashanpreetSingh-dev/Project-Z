import { Meta, StoryObj } from "@storybook/react";
import { MagneticButton, HoverScale, GlowButtonWrapper } from "./magnetic-button";
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

export const HoverScaleExample: Story = {
  render: () => (
    <HoverScale>
      <Button>Hover to Scale</Button>
    </HoverScale>
  ),
};

export const GlowButtonExample: Story = {
  render: () => (
    <GlowButtonWrapper>
      <Button className="gradient-bg text-white">Glow Button</Button>
    </GlowButtonWrapper>
  ),
};

export const AllEffects: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <MagneticButton>
        <Button>Magnetic Effect</Button>
      </MagneticButton>
      <HoverScale>
        <Button variant="outline">Hover Scale Effect</Button>
      </HoverScale>
      <GlowButtonWrapper>
        <Button className="gradient-bg text-white">Glow Effect</Button>
      </GlowButtonWrapper>
    </div>
  ),
};
