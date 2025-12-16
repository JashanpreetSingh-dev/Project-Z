import { Meta, StoryObj } from "@storybook/nextjs-vite";
import { Input } from "./input";

const meta = {
  title: "UI/Input",
  component: Input,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    disabled: {
      control: "boolean",
    },
    placeholder: {
      control: "text",
    },
  },
} as Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    placeholder: "Enter text...",
  },
};

export const WithValue: Story = {
  args: {
    defaultValue: "Example value",
  },
};

export const Email: Story = {
  args: {
    type: "email",
    placeholder: "email@example.com",
  },
};

export const Password: Story = {
  args: {
    type: "password",
    placeholder: "Enter password",
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "Disabled input",
    defaultValue: "Cannot edit",
  },
};

export const WithError: Story = {
  args: {
    placeholder: "Input with error",
    className: "border-destructive focus-visible:ring-destructive",
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 w-[350px]">
      <div>
        <label className="text-sm font-medium mb-2 block">Default</label>
        <Input placeholder="Enter text..." />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Email</label>
        <Input type="email" placeholder="email@example.com" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Password</label>
        <Input type="password" placeholder="Enter password" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Disabled</label>
        <Input disabled placeholder="Disabled input" />
      </div>
      <div>
        <label className="text-sm font-medium mb-2 block">Error State</label>
        <Input
          placeholder="Input with error"
          className="border-destructive focus-visible:ring-destructive"
        />
      </div>
    </div>
  ),
};
