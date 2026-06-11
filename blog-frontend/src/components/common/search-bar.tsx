"use client";

import { useId } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  label = "Search",
  placeholder = "Search",
}: SearchBarProps) {
  const inputId = useId();

  return (
    <div className="grid gap-2">
      <label htmlFor={inputId} className="text-sm font-medium text-foreground">
        {label}
      </label>
      <div className="relative">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          id={inputId}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="pl-9"
          placeholder={placeholder}
          type="search"
          autoComplete="off"
        />
      </div>
    </div>
  );
}
