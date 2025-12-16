import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Textarea } from "./textarea";

const meta = {
  title: "UI/Textarea",
  component: Textarea,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
    rows: {
      control: "number",
    },
  },
} as Meta<typeof Textarea>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter your message...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "This is a textarea with some content in it.",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled textarea",
    defaultValue: "This textarea is disabled",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Textarea with error",
    className: "border-destructive focus-visible:ring-destructive",
  },
};

export const Large: Story = {
  args: {
    placeholder: "Large textarea",
    className: "min-h-[200px]",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[350px]">
      <div>
        <label className="text-sm font-medium mb-2 block">Default</label>
        <Textarea placeholder="Enter your message..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">With Content</label>
        <Textarea defaultValue="This is a textarea with some content in it." />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Disabled</label>
        <Textarea disabled placeholder="Disabled textarea" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Error State</label>
        <Textarea
          placeholder="Textarea with error"
          className="border-destructive focus-visible:ring-destructive"
        />
      </div>
    </div>
  ),
};
