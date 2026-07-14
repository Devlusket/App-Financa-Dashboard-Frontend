"use client";

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ValorPorCategoria } from "@/types/dashboard";

const colors = ["var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)", "var(--primary)"];
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function GraficoCategorias({ dados }: { dados: ValorPorCategoria[] }) {
  if (dados.length === 0) {
    return <div className="grid h-72 place-items-center text-center text-sm text-muted-foreground">Nenhum gasto por categoria neste mês.</div>;
  }

  const chartData = [...dados].sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 8);

  return (
    <div className="h-72 w-full" aria-label="Gráfico de gastos por categoria">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="nome" width={92} tick={{ fontSize: 12, fill: "var(--muted-foreground)" }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(value) => currency.format(Number(value))} cursor={{ fill: "var(--muted)" }} contentStyle={{ borderRadius: 10, borderColor: "var(--border)", background: "var(--popover)" }} />
          <Bar dataKey="total" radius={[0, 6, 6, 0]}>
            {chartData.map((item, index) => <Cell key={item.categoriaId} fill={colors[index % colors.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
