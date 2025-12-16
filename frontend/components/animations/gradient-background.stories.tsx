import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { GradientBackground } from "./gradient-background";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

const meta = {
  title: "Animations/GradientBackground",
  component: GradientBackground,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["hero", "subtle", "vibrant"],
    },
  },
} as Meta<typeof GradientBackground>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Hero: Story = {
  render: () => (
    <GradientBackground variant="hero" className="p-12 rounded-lg">
      <Card className="w-[400px] bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Hero Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This uses the hero variant with vibrant animated gradients</p>
        </CardContent>
      </Card>
    </GradientBackground>
  ),
};

export const Subtle: Story = {
  render: () => (
    <GradientBackground variant="subtle" className="p-12 rounded-lg">
      <Card className="w-[400px] bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Subtle Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This uses the subtle variant with softer gradients</p>
        </CardContent>
      </Card>
    </GradientBackground>
  ),
};

export const Vibrant: Story = {
  render: () => (
    <GradientBackground variant="vibrant" className="p-12 rounded-lg">
      <Card className="w-[400px] bg-card/50 backdrop-blur-sm">
        <CardHeader>
          <CardTitle>Vibrant Variant</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This uses the vibrant variant with intense animated gradients</p>
        </CardContent>
      </Card>
    </GradientBackground>
  ),
};

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col gap-8 w-full max-w-4xl">
      <div>
        <h3 className="text-lg font-semibold mb-4">Hero Variant</h3>
        <GradientBackground variant="hero" className="p-8 rounded-lg">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Hero Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Vibrant animated gradients for hero sections</p>
            </CardContent>
          </Card>
        </GradientBackground>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Subtle Variant</h3>
        <GradientBackground variant="subtle" className="p-8 rounded-lg">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Subtle Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Softer gradients for content sections</p>
            </CardContent>
          </Card>
        </GradientBackground>
      </div>
      <div>
        <h3 className="text-lg font-semibold mb-4">Vibrant Variant</h3>
        <GradientBackground variant="vibrant" className="p-8 rounded-lg">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle>Vibrant Background</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Intense animated gradients for impact</p>
            </CardContent>
          </Card>
        </GradientBackground>
      </div>
    </div>
  ),
};
