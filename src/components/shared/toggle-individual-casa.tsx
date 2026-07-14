"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
  const indicatorId = useId();
  const prefersReducedMotion = useReducedMotion();

  return (
    <div className={cn("inline-flex rounded-xl border bg-muted/60 p-1 shadow-inner", className)} role="group" aria-label="Visão financeira">
      {options.map(({ value: optionValue, label, icon: Icon }) => {
        const selected = value === optionValue;
        return (
          <button
            key={optionValue}
            type="button"
            aria-pressed={selected}
            disabled={disabled}
            onClick={() => onChange(optionValue)}
            className={cn("relative flex h-8 items-center gap-2 rounded-lg px-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50", selected ? "text-foreground" : "text-muted-foreground hover:text-foreground")}
          >
            {selected && <motion.span layoutId={`toggle-indicator-${indicatorId}`} className="absolute inset-0 rounded-lg bg-background shadow-sm ring-1 ring-black/5" transition={prefersReducedMotion ? { duration: 0 } : { type: "spring", stiffness: 420, damping: 32 }} />}
            <Icon className="relative z-10 size-4" />
            <span className="relative z-10">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
