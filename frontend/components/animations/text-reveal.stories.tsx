import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GradientTextReveal } from "./text-reveal";

const meta = {
  title: "Animations/TextReveal",
  component: GradientTextReveal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    delay: {
      control: "number",
    },
  },
} as Meta<typeof GradientTextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <GradientTextReveal className="text-2xl font-bold">
      This text reveals word by word
    </GradientTextReveal>
  ),
};

export const LongText: Story = {
  render: () => (
    <GradientTextReveal className="text-xl font-bold">
      This is a longer piece of text that reveals word by word with a smooth animation effect
    </GradientTextReveal>
  ),
};

export const WithDelay: Story = {
  render: () => (
    <GradientTextReveal className="text-2xl font-bold" delay={0.5}>
      Text that starts after a delay
    </GradientTextReveal>
  ),
};

export const FastStagger: Story = {
  render: () => (
    <GradientTextReveal className="text-2xl font-bold">
      Fast stagger animation
    </GradientTextReveal>
  ),
};

export const SlowStagger: Story = {
  render: () => (
    <GradientTextReveal className="text-2xl font-bold">
      Slow stagger animation
    </GradientTextReveal>
  ),
};

// ByCharacter and GradientTextExample stories removed - TextRevealByChar and GradientText are not exported

export const GradientTextRevealExample: Story = {
  render: () => (
    <GradientTextReveal className="text-4xl font-bold">
      Gradient Text with Reveal
    </GradientTextReveal>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center max-w-2xl">
      <div className="text-center">
        <GradientTextReveal className="text-3xl font-bold">
          Animated Gradient Text
        </GradientTextReveal>
        <p className="text-sm text-muted-foreground mt-2">Animated gradient</p>
      </div>
    </div>
  ),
};
