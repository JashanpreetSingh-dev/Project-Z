import { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  BlurReveal,
  BlurStaggerContainer,
  BlurStaggerItem,
  FadeBlur,
} from "./blur-reveal";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const meta = {
  title: "Animations/BlurReveal",
  component: BlurReveal,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    delay: {
      control: "number",
    },
    duration: {
      control: "number",
    },
    blurAmount: {
      control: { type: "range", min: 0, max: 20, step: 1 },
    },
    direction: {
      control: "select",
      options: ["up", "down", "left", "right", "none"],
    },
  },
} as Meta<typeof BlurReveal>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <BlurReveal>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Blur Reveal Card</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card reveals with a blur effect</p>
        </CardContent>
      </Card>
    </BlurReveal>
  ),
};

export const FromUp: Story = {
  render: () => (
    <BlurReveal direction="up">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Reveal from Up</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card reveals from the top</p>
        </CardContent>
      </Card>
    </BlurReveal>
  ),
};

export const FromDown: Story = {
  render: () => (
    <BlurReveal direction="down">
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Reveal from Down</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card reveals from the bottom</p>
        </CardContent>
      </Card>
    </BlurReveal>
  ),
};

export const StrongBlur: Story = {
  render: () => (
    <BlurReveal blurAmount={15}>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Strong Blur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This card uses a strong blur effect</p>
        </CardContent>
      </Card>
    </BlurReveal>
  ),
};

export const StaggerContainer: Story = {
  render: () => (
    <BlurStaggerContainer className="flex flex-col gap-4">
      <BlurStaggerItem>
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Card 1</CardTitle>
          </CardHeader>
          <CardContent>
            <p>First card with stagger</p>
          </CardContent>
        </Card>
      </BlurStaggerItem>
      <BlurStaggerItem>
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Card 2</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Second card with stagger</p>
          </CardContent>
        </Card>
      </BlurStaggerItem>
      <BlurStaggerItem>
        <Card className="w-[300px]">
          <CardHeader>
            <CardTitle>Card 3</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Third card with stagger</p>
          </CardContent>
        </Card>
      </BlurStaggerItem>
    </BlurStaggerContainer>
  ),
};

export const FadeBlurExample: Story = {
  render: () => (
    <FadeBlur>
      <Card className="w-[300px]">
        <CardHeader>
          <CardTitle>Fade Blur</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Fade blur effect with scale</p>
        </CardContent>
      </Card>
    </FadeBlur>
  ),
};

export const AllDirections: Story = {
  render: () => (
    <div className="flex flex-col gap-8 items-center">
      <BlurReveal direction="up">
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Up</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reveals from top</p>
          </CardContent>
        </Card>
      </BlurReveal>
      <BlurReveal direction="down">
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Down</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reveals from bottom</p>
          </CardContent>
        </Card>
      </BlurReveal>
      <BlurReveal direction="left">
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Left</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reveals from left</p>
          </CardContent>
        </Card>
      </BlurReveal>
      <BlurReveal direction="right">
        <Card className="w-[250px]">
          <CardHeader>
            <CardTitle>Right</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Reveals from right</p>
          </CardContent>
        </Card>
      </BlurReveal>
    </div>
  ),
};
