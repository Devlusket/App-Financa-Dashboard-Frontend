"use client";

import { useEffect } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

type ResumoCardProps = {
  titulo: string;
  valor: number;
  icone?: LucideIcon;
  descricao?: string;
  destaque?: boolean;
  className?: string;
  tone?: "income" | "expense" | "savings" | "balance";
  delay?: number;
};

const toneStyles = {
  income: { card: "border-emerald-200/70 bg-gradient-to-br from-background via-background to-emerald-50 dark:border-emerald-900 dark:to-emerald-950/40", icon: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300", glow: "bg-emerald-400" },
  expense: { card: "border-rose-200/70 bg-gradient-to-br from-background via-background to-rose-50 dark:border-rose-900 dark:to-rose-950/40", icon: "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300", glow: "bg-rose-400" },
  savings: { card: "border-sky-200/70 bg-gradient-to-br from-background via-background to-sky-50 dark:border-sky-900 dark:to-sky-950/40", icon: "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300", glow: "bg-sky-400" },
  balance: { card: "border-transparent bg-gradient-to-br from-emerald-700 via-emerald-700 to-teal-900 text-white shadow-lg shadow-emerald-900/15", icon: "bg-white/15 text-white", glow: "bg-white" },
};

export function ResumoCard({ titulo, valor, icone: Icon, descricao, destaque = false, className, tone = destaque ? "balance" : "income", delay = 0 }: ResumoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const styles = toneStyles[tone];
  const animatedValue = useMotionValue(prefersReducedMotion ? valor : 0);
  const formattedValue = useTransform(animatedValue, (current) => currencyFormatter.format(current));

  useEffect(() => {
    if (prefersReducedMotion) {
      animatedValue.set(valor);
      return;
    }

    const controls = animate(animatedValue, valor, { duration: 0.95, ease: [0.16, 1, 0.3, 1] });
    return () => controls.stop();
  }, [animatedValue, prefersReducedMotion, valor]);

  return (
    <motion.div initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 18, scale: prefersReducedMotion ? 1 : 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} whileHover={prefersReducedMotion ? undefined : { y: -4 }} transition={{ duration: 0.5, delay: prefersReducedMotion ? 0 : delay, ease: [0.16, 1, 0.3, 1] }} className="h-full">
      <Card className={cn("relative h-full overflow-hidden shadow-sm transition-shadow hover:shadow-lg", styles.card, className)}>
        <span className={cn("absolute -right-8 -top-8 size-24 rounded-full opacity-[0.08] blur-2xl", styles.glow)} />
        <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className={cn("text-sm font-medium", destaque ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {titulo}
          </CardTitle>
          {Icon && (
            <span className={cn("grid size-10 place-items-center rounded-xl shadow-sm", styles.icon)}>
              <Icon className="size-4" />
            </span>
          )}
        </CardHeader>
        <CardContent>
          <motion.span className="block text-2xl font-semibold tracking-tight tabular-nums sm:text-3xl">
            {formattedValue}
          </motion.span>
          {descricao && <p className={cn("mt-1 text-xs", destaque ? "text-primary-foreground/70" : "text-muted-foreground")}>{descricao}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
