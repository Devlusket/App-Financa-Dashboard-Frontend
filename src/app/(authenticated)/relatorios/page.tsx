"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, House, Info, UserRound } from "lucide-react";
import { SeletorMes } from "@/components/shared/seletor-mes";
import { ToggleIndividualCasa, type VisaoFinanceira } from "@/components/shared/toggle-individual-casa";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type { RelatorioMensal, ResumoFinanceiro, ValorPorCategoria } from "@/types/dashboard";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function MetricRow({ label, value, emphasis = false }: { label: string; value: number; emphasis?: boolean }) {
  return <div className={`flex items-center justify-between gap-4 border-b py-3 last:border-0 ${emphasis ? "text-base font-semibold" : "text-sm"}`}><span className={emphasis ? "text-foreground" : "text-muted-foreground"}>{label}</span><span className="tabular-nums">{currency.format(Number(value))}</span></div>;
}

function CategoryTable({ title, description, items }: { title: string; description: string; items: ValorPorCategoria[] }) {
  return (
    <Card className="min-w-0">
      <CardHeader><CardTitle>{title}</CardTitle><CardDescription>{description}</CardDescription></CardHeader>
      <CardContent className="px-0 sm:px-5">
        <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Categoria</TableHead><TableHead className="text-right">Total</TableHead></TableRow></TableHeader><TableBody>{items.length === 0 ? <TableRow><TableCell colSpan={2} className="h-24 text-center text-muted-foreground">Nenhum valor neste mês.</TableCell></TableRow> : [...items].sort((a, b) => Number(b.total) - Number(a.total)).map((item) => <TableRow key={item.categoriaId}><TableCell className="font-medium">{item.nome}</TableCell><TableCell className="text-right font-medium tabular-nums">{currency.format(Number(item.total))}</TableCell></TableRow>)}</TableBody></Table></div>
      </CardContent>
    </Card>
  );
}

export default function RelatoriosPage() {
  const [mes, setMes] = useState(() => format(new Date(), "yyyy-MM"));
  const [visao, setVisao] = useState<VisaoFinanceira>("casa");
  const [pessoaId, setPessoaId] = useState("");
  const [relatorio, setRelatorio] = useState<RelatorioMensal | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const requestStart = window.setTimeout(() => {
      setIsLoading(true);
      apiClient.get<RelatorioMensal>(`/relatorios/mensal?mes=${mes}`)
        .then((response) => {
          if (cancelled) return;
          setRelatorio(response);
          setPessoaId((current) => response.porPessoa.some((pessoa) => pessoa.pessoaId === current) ? current : response.porPessoa[0]?.pessoaId ?? "");
        })
        .finally(() => { if (!cancelled) setIsLoading(false); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(requestStart); };
  }, [mes]);

  const selectedPerson = relatorio?.porPessoa.find((pessoa) => pessoa.pessoaId === pessoaId) ?? relatorio?.porPessoa[0];
  const summary: ResumoFinanceiro = visao === "casa"
    ? relatorio?.casa ?? { renda: 0, gasto: 0, guardado: 0, saldo: 0 }
    : selectedPerson ?? { renda: 0, gasto: 0, guardado: 0, saldo: 0 };
  const categoryExpenses = visao === "casa" ? relatorio?.gastosPorCategoria ?? [] : selectedPerson?.gastosPorCategoria ?? [];
  const categorySavings = visao === "casa" ? relatorio?.guardadoPorCategoria ?? [] : selectedPerson?.guardadoPorCategoria ?? [];
  const monthLabel = format(new Date(`${mes}-02T12:00:00`), "MMMM 'de' yyyy", { locale: ptBR });

  return (
    <section>
      <div className="mb-7 flex flex-col justify-between gap-5 xl:flex-row xl:items-end">
        <div><p className="mb-1 text-sm font-medium text-primary">Arquivo mensal</p><h1 className="text-3xl font-semibold tracking-tight">Relatórios</h1><p className="mt-2 text-muted-foreground">Consulte os números consolidados de qualquer mês.</p></div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {visao === "individual" && relatorio?.porPessoa.length ? <div className="space-y-1.5"><label htmlFor="pessoa-relatorio" className="text-xs text-muted-foreground">Pessoa</label><Select value={pessoaId} onValueChange={(value) => { if (value) setPessoaId(value); }}><SelectTrigger id="pessoa-relatorio" className="w-full sm:w-40"><UserRound /><SelectValue>{(value) => relatorio.porPessoa.find((pessoa) => pessoa.pessoaId === value)?.nome ?? "Pessoa"}</SelectValue></SelectTrigger><SelectContent>{relatorio.porPessoa.map((pessoa) => <SelectItem key={pessoa.pessoaId} value={pessoa.pessoaId}>{pessoa.nome}</SelectItem>)}</SelectContent></Select></div> : null}
          <ToggleIndividualCasa value={visao} onChange={setVisao} />
          <SeletorMes value={mes} onChange={setMes} />
        </div>
      </div>

      {isLoading || !relatorio ? (
        <div className="space-y-5"><Skeleton className="h-56 rounded-xl" /><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-72 rounded-xl" /><Skeleton className="h-72 rounded-xl" /></div></div>
      ) : (
        <div className="space-y-5">
          <Card>
            <CardHeader className="flex-row items-start justify-between gap-4"><div><div className="mb-2 flex items-center gap-2"><Badge variant="outline">{visao === "casa" ? <House /> : <UserRound />}{visao === "casa" ? "Casa" : selectedPerson?.nome}</Badge><Badge variant="secondary" className="capitalize">{monthLabel}</Badge></div><CardTitle>Resumo financeiro</CardTitle><CardDescription>Saldo = renda − gasto − guardado.</CardDescription></div><span className="grid size-10 place-items-center rounded-xl bg-muted text-muted-foreground"><FileText className="size-5" /></span></CardHeader>
            <CardContent className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-4"><MetricRow label="Renda" value={summary.renda} /><MetricRow label="Gasto" value={summary.gasto} /><MetricRow label="Guardado" value={summary.guardado} /><MetricRow label="Saldo" value={summary.saldo} emphasis /></CardContent>
          </Card>

          <Card className="min-w-0">
            <CardHeader><CardTitle>Comparativo por pessoa</CardTitle><CardDescription>Valores individuais calculados pelas regras de cada categoria.</CardDescription></CardHeader>
            <CardContent className="px-0 sm:px-5"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Pessoa</TableHead><TableHead className="text-right">Renda</TableHead><TableHead className="text-right">Gasto</TableHead><TableHead className="text-right">Guardado</TableHead><TableHead className="text-right">Saldo</TableHead></TableRow></TableHeader><TableBody>{relatorio.porPessoa.map((pessoa) => <TableRow key={pessoa.pessoaId}><TableCell className="font-medium">{pessoa.nome}</TableCell><TableCell className="text-right tabular-nums">{currency.format(Number(pessoa.renda))}</TableCell><TableCell className="text-right tabular-nums">{currency.format(Number(pessoa.gasto))}</TableCell><TableCell className="text-right tabular-nums">{currency.format(Number(pessoa.guardado))}</TableCell><TableCell className="text-right font-semibold tabular-nums">{currency.format(Number(pessoa.saldo))}</TableCell></TableRow>)}<TableRow className="bg-muted/40"><TableCell className="font-semibold">Casa</TableCell><TableCell className="text-right font-semibold tabular-nums">{currency.format(Number(relatorio.casa.renda))}</TableCell><TableCell className="text-right font-semibold tabular-nums">{currency.format(Number(relatorio.casa.gasto))}</TableCell><TableCell className="text-right font-semibold tabular-nums">{currency.format(Number(relatorio.casa.guardado))}</TableCell><TableCell className="text-right font-semibold tabular-nums">{currency.format(Number(relatorio.casa.saldo))}</TableCell></TableRow></TableBody></Table></div></CardContent>
          </Card>

          <div className="grid gap-5 lg:grid-cols-2"><CategoryTable title="Gastos por categoria" description={visao === "casa" ? "Consolidado da casa." : `Responsabilidade de ${selectedPerson?.nome}.`} items={categoryExpenses} /><CategoryTable title="Guardado por categoria" description="Poupança e investimentos separados dos gastos." items={categorySavings} /></div>

          <p className="flex items-center justify-center gap-2 py-2 text-center text-xs text-muted-foreground"><Info className="size-3.5" /> Relatório consultivo — os valores refletem todos os lançamentos pagos e pendentes do mês.</p>
        </div>
      )}
    </section>
  );
}
