"use client";

import { CheckCircle2, Clock3 } from "lucide-react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type StatusLancamento = "PAGO" | "PENDENTE";

type StatusBadgeProps = {
  status: StatusLancamento;
  onChange?: (status: StatusLancamento) => void;
  disabled?: boolean;
  className?: string;
};

export function StatusBadge({ status, onChange, disabled, className }: StatusBadgeProps) {
  const pago = status === "PAGO";
  const Icon = pago ? CheckCircle2 : Clock3;
  const label = pago ? "Pago" : "Pendente";
  const styles = cn(
    pago ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300" : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-300",
    className,
  );

  if (!onChange) {
    return <Badge variant="outline" className={styles}><Icon />{label}</Badge>;
  }

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => onChange(pago ? "PENDENTE" : "PAGO")}
      aria-label={`${label}. Alterar para ${pago ? "Pendente" : "Pago"}`}
      className={cn(badgeVariants({ variant: "outline" }), styles, "cursor-pointer hover:brightness-95 disabled:pointer-events-none disabled:opacity-50")}
    >
      <Icon />{label}
    </button>
  );
}
