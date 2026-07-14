"use client";

import { House, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export type VisaoFinanceira = "individual" | "casa";

type ToggleIndividualCasaProps = {
  value: VisaoFinanceira;
  onChange: (value: VisaoFinanceira) => void;
  disabled?: boolean;
  className?: string;
};

const options = [
  { value: "individual" as const, label: "Individual", icon: UserRound },
  { value: "casa" as const, label: "Casa", icon: House },
];

export function ToggleIndividualCasa({ value, onChange, disabled, className }: ToggleIndividualCasaProps) {
  return (
    <div className={cn("inline-flex rounded-xl border bg-muted/60 p-1", className)} role="group" aria-label="Visão financeira">
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const selected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn(
              "flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
              selected ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
