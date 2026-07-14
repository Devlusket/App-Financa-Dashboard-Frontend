"use client";

import { CalendarDays } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type SeletorMesProps = {
  value: string;
  onChange: (mes: string) => void;
  label?: string;
  min?: string;
  max?: string;
  disabled?: boolean;
  className?: string;
  id?: string;
};

export function SeletorMes({ value, onChange, label = "Mês de referência", min, max, disabled, className, id = "mes-referencia" }: SeletorMesProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-xs text-muted-foreground">{label}</Label>
      <div className="relative">
        <CalendarDays className="pointer-events-none absolute left-3 top-1/2 z-10 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          id={id}
          type="month"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full min-w-44 pl-9 sm:w-auto"
        />
      </div>
    </div>
  );
}
