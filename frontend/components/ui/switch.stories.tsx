import { Meta, StoryObj } from "@storybook/react";
import { Switch } from "./switch";
import { Label } from "./label";
import { useState } from "react";

const meta = {
  title: "UI/Switch",
  component: Switch,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    checked: {
      control: "boolean",
    },
    disabled: {
      control: "boolean",
    },
  },
} as Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <div className="flex items-center space-x-2">
        <Switch id="switch-default" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="switch-default">Enable notifications</Label>
      </div>
    );
  },
};

export const Checked: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return (
      <div className="flex items-center space-x-2">
        <Switch id="switch-checked" checked={checked} onCheckedChange={setChecked} />
        <Label htmlFor="switch-checked">Notifications enabled</Label>
      </div>
    );
  },
};

export const Disabled: Story = {
  render: () => (
    <div className="flex flex-col gap-4">
      <div className="flex items-center space-x-2">
        <Switch id="switch-disabled-unchecked" disabled />
        <Label htmlFor="switch-disabled-unchecked">Disabled (unchecked)</Label>
      </div>
      <div className="flex items-center space-x-2">
        <Switch id="switch-disabled-checked" checked disabled />
        <Label htmlFor="switch-disabled-checked">Disabled (checked)</Label>
      </div>
    </div>
  ),
};

export const AllStates: Story = {
  render: () => {
    const [checked1, setChecked1] = useState(false);
    const [checked2, setChecked2] = useState(true);
    return (
      <div className="flex flex-col gap-4">
        <div className="flex items-center space-x-2">
          <Switch id="switch-1" checked={checked1} onCheckedChange={setChecked1} />
          <Label htmlFor="switch-1">Unchecked (interactive)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="switch-2" checked={checked2} onCheckedChange={setChecked2} />
          <Label htmlFor="switch-2">Checked (interactive)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="switch-3" disabled />
          <Label htmlFor="switch-3">Disabled (unchecked)</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch id="switch-4" checked disabled />
          <Label htmlFor="switch-4">Disabled (checked)</Label>
        </div>
      </div>
    );
  },
};
