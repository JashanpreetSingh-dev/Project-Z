import { Meta, StoryObj } from "@storybook/react";
import {
  TextReveal,
  TextRevealByChar,
  GradientText,
  GradientTextReveal,
} from "./text-reveal";

const meta = {
  title: "Animations/TextReveal",
  component: TextReveal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    text: {
      control: "text",
    },
    delay: {
      control: "number",
    },
    staggerDelay: {
      control: "number",
    },
  },
} as Meta<typeof TextReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    text: "This text reveals word by word",
  },
};

export const LongText: Story = {
  args: {
    text: "This is a longer piece of text that reveals word by word with a smooth animation effect",
  },
};

export const WithDelay: Story = {
  args: {
    text: "Text that starts after a delay",
    delay: 0.5,
  },
};

export const FastStagger: Story = {
  args: {
    text: "Fast stagger animation",
    staggerDelay: 0.02,
  },
};

export const SlowStagger: Story = {
  args: {
    text: "Slow stagger animation",
    staggerDelay: 0.1,
  },
};

export const ByCharacter: Story = {
  render: () => (
    <TextRevealByChar text="Character by character reveal" className="text-2xl" />
  ),
};

export const GradientTextExample: Story = {
  render: () => (
    <GradientText className="text-4xl font-bold">
      Gradient Text Example
    </GradientText>
  ),
};

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
        <TextReveal
          text="Word by word reveal animation"
          className="text-3xl font-bold"
        />
        <p className="text-sm text-muted-foreground mt-2">Word reveal</p>
      </div>
      <div className="text-center">
        <TextRevealByChar
          text="Character by character"
          className="text-2xl"
        />
        <p className="text-sm text-muted-foreground mt-2">Character reveal</p>
      </div>
      <div className="text-center">
        <GradientText className="text-3xl font-bold">
          Static Gradient Text
        </GradientText>
        <p className="text-sm text-muted-foreground mt-2">Static gradient</p>
      </div>
      <div className="text-center">
        <GradientTextReveal className="text-3xl font-bold">
          Animated Gradient Text
        </GradientTextReveal>
        <p className="text-sm text-muted-foreground mt-2">Animated gradient</p>
      </div>
    </div>
  ),
};
