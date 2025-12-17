"use client";

import * as React from "react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

export interface SelectOption {
  value: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  id?: string;
}

const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  ({ value, onValueChange, options, placeholder, className, id }, ref) => {
    const selectedOption = options.find((opt) => opt.value === value);

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            ref={ref}
            id={id}
            variant="outline"
            className={cn(
              "w-full justify-between bg-background hover:bg-accent",
              className
            )}
          >
            <div className="flex items-center gap-2">
              {selectedOption?.icon && (
                <selectedOption.icon className="h-4 w-4 text-muted-foreground" />
              )}
              <span>{selectedOption?.label || placeholder || "Select..."}</span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onValueChange(option.value)}
              className="cursor-pointer"
            >
              <div className="flex items-center gap-2 w-full">
                {option.icon && (
                  <option.icon className="h-4 w-4 text-muted-foreground" />
                )}
                <span className="flex-1">{option.label}</span>
                {value === option.value && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }
);
Select.displayName = "Select";

// Legacy exports for backward compatibility
const SelectTrigger = Select;
const SelectValue = ({ placeholder }: { placeholder?: string }) => {
  return <>{placeholder}</>;
};
const SelectContent = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>;
};
const SelectItem = React.forwardRef<
  HTMLOptionElement,
  React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, ...props }, ref) => (
  <option ref={ref} className={className} {...props} />
));
SelectItem.displayName = "SelectItem";

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
