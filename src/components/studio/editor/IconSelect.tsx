"use client";

import { createElement } from "react";
import { ICON_NAMES, iconOf } from "@/components/blocks/icon-map";
import { Select } from "../ui/Select";

export function IconSelect({ value, onChange }: { value?: string; onChange: (v: string) => void }) {
  // iconOf() is a static lookup, not a component factory, but assigning its
  // result to a capitalized local and using it as a JSX tag reads as
  // "component created during render" to the react-hooks static-components
  // lint rule. createElement sidesteps the (mis)detection without changing
  // behavior — see QuickLinks.tsx/CoreValues.tsx for the JSX-tag version of
  // this same idiom, which the rule doesn't flag because it's inside a
  // .map() callback.
  const Icon = iconOf(value);
  return (
    <div className="flex items-center gap-2">
      <span className="w-8 h-8 rounded-lg bg-studio-soft border border-studio-border inline-flex items-center justify-center text-studio-ink-2 shrink-0">
        {createElement(Icon, { className: "w-4 h-4" })}
      </span>
      <Select value={value || ""} onChange={(e) => onChange(e.target.value)}>
        <option value="">— icon —</option>
        {ICON_NAMES.map((n) => (
          <option key={n} value={n}>{n}</option>
        ))}
      </Select>
    </div>
  );
}
