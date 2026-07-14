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
};

export function ResumoCard({ titulo, valor, icone: Icon, descricao, destaque = false, className }: ResumoCardProps) {
  const prefersReducedMotion = useReducedMotion();
  const animatedValue = useMotionValue(prefersReducedMotion ? valor : 0);
  const formattedValue = useTransform(animatedValue, (current) => currencyFormatter.format(current));

  useEffect(() => {
    if (prefersReducedMotion) {
      animatedValue.set(valor);
      return;
    }

    const controls = animate(animatedValue, valor, { duration: 0.65, ease: "easeOut" });
    return () => controls.stop();
  }, [animatedValue, prefersReducedMotion, valor]);

  return (
    <motion.div initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className={cn("h-full", destaque && "border-primary/30 bg-primary text-primary-foreground", className)}>
        <CardHeader className="flex-row items-center justify-between gap-3 pb-2">
          <CardTitle className={cn("text-sm font-medium", destaque ? "text-primary-foreground/80" : "text-muted-foreground")}>
            {titulo}
          </CardTitle>
          {Icon && (
            <span className={cn("grid size-9 place-items-center rounded-lg", destaque ? "bg-primary-foreground/15" : "bg-muted text-muted-foreground")}>
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
