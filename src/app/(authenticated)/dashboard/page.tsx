"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CreditCard, Pencil, PiggyBank, Plus, Trash2, TrendingUp, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { motion, useReducedMotion } from "framer-motion";
import { GraficoCategorias } from "@/components/dashboard/grafico-categorias";
import { LancamentoForm } from "@/components/lancamentos/lancamento-form";
import { ResumoCard } from "@/components/shared/resumo-card";
import { SeletorMes } from "@/components/shared/seletor-mes";
import { StatusBadge, type StatusLancamento } from "@/components/shared/status-badge";
import { ToggleIndividualCasa, type VisaoFinanceira } from "@/components/shared/toggle-individual-casa";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { apiClient } from "@/lib/api-client";
import type { Categoria, Pessoa } from "@/types/categoria";
import type { Lancamento, LancamentoPayload, RelatorioMensal, ResumoFinanceiro, ValorPorCategoria } from "@/types/dashboard";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

function CategoryList({ items, emptyMessage, inverse = false }: { items: ValorPorCategoria[]; emptyMessage: string; inverse?: boolean }) {
  if (items.length === 0) return <p className={`py-6 text-center text-sm ${inverse ? "text-emerald-100" : "text-muted-foreground"}`}>{emptyMessage}</p>;
  return <div className="divide-y">{items.map((item) => <div key={item.categoriaId} className="flex items-center justify-between gap-4 py-2.5 text-sm"><span className={`truncate ${inverse ? "text-emerald-100" : "text-muted-foreground"}`}>{item.nome}</span><strong className="shrink-0 tabular-nums">{currency.format(Number(item.total))}</strong></div>)}</div>;
}

function DashboardSkeleton() {
  return <div className="space-y-6"><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-36 rounded-xl" />)}</div><div className="grid gap-5 lg:grid-cols-2"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div><Skeleton className="h-96 rounded-xl" /></div>;
}

function AnimatedPanel({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const reducedMotion = useReducedMotion();
  return (
    <motion.div
      initial={{ opacity: 0, y: reducedMotion ? 0 : 22 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: reducedMotion ? 0 : 0.55, delay: reducedMotion ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export default function DashboardPage() {
  const [mes, setMes] = useState(() => format(new Date(), "yyyy-MM"));
  const [visao, setVisao] = useState<VisaoFinanceira>("casa");
  const [pessoaId, setPessoaId] = useState("");
  const [relatorio, setRelatorio] = useState<RelatorioMensal | null>(null);
  const [lancamentos, setLancamentos] = useState<Lancamento[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Lancamento | null>(null);
  const [filterPessoa, setFilterPessoa] = useState("todos");
  const [filterCategoria, setFilterCategoria] = useState("todas");
  const [deleting, setDeleting] = useState<Lancamento | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const [reportResponse, launchesResponse, categoriesResponse, peopleResponse] = await Promise.all([
        apiClient.get<RelatorioMensal>(`/relatorios/mensal?mes=${mes}`),
        apiClient.get<Lancamento[]>(`/lancamentos?mes=${mes}`),
        apiClient.get<Categoria[]>("/categorias"),
        apiClient.get<Pessoa[]>("/pessoas"),
      ]);
      setRelatorio(reportResponse);
      setLancamentos(launchesResponse);
      setCategorias(categoriesResponse);
      setPessoas(peopleResponse);
      setPessoaId((current) => reportResponse.porPessoa.some((item) => item.pessoaId === current) ? current : reportResponse.porPessoa[0]?.pessoaId ?? "");
    } finally {
      setIsLoading(false);
    }
  }, [mes]);

  useEffect(() => {
    const requestStart = window.setTimeout(() => { void fetchData(true); }, 0);
    return () => window.clearTimeout(requestStart);
  }, [fetchData]);

  const selectedPerson = relatorio?.porPessoa.find((item) => item.pessoaId === pessoaId) ?? relatorio?.porPessoa[0];
  const metrics: ResumoFinanceiro = visao === "casa"
    ? relatorio?.casa ?? { renda: 0, gasto: 0, guardado: 0, saldo: 0 }
    : selectedPerson ?? { renda: 0, gasto: 0, guardado: 0, saldo: 0 };
  const pessoaPorId = useMemo(() => new Map(pessoas.map((pessoa) => [pessoa.id, pessoa.nome])), [pessoas]);
  const categoriaPorId = useMemo(() => new Map(categorias.map((categoria) => [categoria.id, categoria.nome])), [categorias]);
  const monthLabel = format(new Date(`${mes}-02T12:00:00`), "MMMM 'de' yyyy", { locale: ptBR });
  const filteredLancamentos = useMemo(() => lancamentos.filter((item) =>
    (filterPessoa === "todos" || item.responsavelPagamentoId === filterPessoa)
    && (filterCategoria === "todas" || item.categoriaId === filterCategoria)
  ), [filterCategoria, filterPessoa, lancamentos]);

  function openCreate() { setEditing(null); setDialogOpen(true); }
  function openEdit(item: Lancamento) { setEditing(item); setDialogOpen(true); }

  async function saveLancamento(payload: LancamentoPayload) {
    if (editing) await apiClient.patch<Lancamento>(`/lancamentos/${editing.id}`, payload);
    else await apiClient.post<Lancamento>("/lancamentos", payload);
    setDialogOpen(false);
    toast.success(editing ? "Lançamento atualizado." : "Lançamento criado.");
    await fetchData();
  }

  async function changeStatus(item: Lancamento, status: StatusLancamento) {
    await apiClient.patch<Lancamento>(`/lancamentos/${item.id}/status`, { status, responsavelPagamentoId: item.responsavelPagamentoId });
    toast.success(status === "PAGO" ? "Lançamento marcado como pago." : "Lançamento marcado como pendente.");
    await fetchData();
  }

  async function deleteLancamento() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await apiClient.delete<void>(`/lancamentos/${deleting.id}`);
      setDeleting(null);
      toast.success("Lançamento excluído.");
      await fetchData();
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section className="pb-4">
      <motion.div initial={{ opacity: 0, scale: 0.985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }} className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-700 via-teal-700 to-slate-950 px-6 pb-14 pt-7 text-white shadow-2xl shadow-emerald-950/20 sm:px-8 sm:pb-16 sm:pt-9">
        <div className="pointer-events-none absolute -right-16 -top-24 size-64 rounded-full bg-cyan-300/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 left-1/4 size-72 rounded-full bg-emerald-300/15 blur-3xl" />
        <div className="relative max-w-2xl"><div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-emerald-50 backdrop-blur"><span className="size-1.5 rounded-full bg-emerald-300 shadow-[0_0_12px_rgba(110,231,183,.9)]" />Visão financeira · {monthLabel}</div><h1 className="text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Seu dinheiro, com clareza.</h1><p className="mt-3 max-w-xl text-sm leading-6 text-emerald-50/75 sm:text-base">Acompanhe renda, gastos e objetivos da casa em uma visão simples, viva e feita para decisões rápidas.</p></div>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12, ease: [0.22, 1, 0.36, 1] }} className="relative z-10 mx-3 -mt-8 mb-8 flex flex-col gap-3 rounded-2xl border border-border/70 bg-background/90 p-4 shadow-xl shadow-slate-950/8 backdrop-blur-xl sm:mx-6 xl:flex-row xl:items-end xl:justify-end">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          {visao === "individual" && pessoas.length > 0 && <div className="space-y-1.5"><label htmlFor="pessoa-dashboard" className="text-xs text-muted-foreground">Pessoa</label><Select value={pessoaId} onValueChange={(value) => { if (value) setPessoaId(value); }}><SelectTrigger id="pessoa-dashboard" className="w-full sm:w-40"><UserRound /><SelectValue>{(value) => pessoaPorId.get(String(value)) ?? "Pessoa"}</SelectValue></SelectTrigger><SelectContent>{pessoas.map((pessoa) => <SelectItem key={pessoa.id} value={pessoa.id}>{pessoa.nome}</SelectItem>)}</SelectContent></Select></div>}
          <ToggleIndividualCasa value={visao} onChange={setVisao} />
          <SeletorMes value={mes} onChange={setMes} />
        </div>
      </motion.div>

      {isLoading || !relatorio ? <DashboardSkeleton /> : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <ResumoCard titulo="Renda" valor={Number(metrics.renda)} icone={TrendingUp} descricao={visao === "casa" ? "Total da casa" : selectedPerson?.nome} tone="income" />
            <ResumoCard titulo="Gasto" valor={Number(metrics.gasto)} icone={CreditCard} descricao="Comprometido no mês" tone="expense" delay={0.07} />
            <ResumoCard titulo="Guardado" valor={Number(metrics.guardado)} icone={PiggyBank} descricao="Poupança e investimentos" tone="savings" delay={0.14} />
            <ResumoCard titulo="Saldo" valor={Number(metrics.saldo)} icone={Wallet} descricao="Renda − gasto − guardado" tone="balance" delay={0.21} destaque />
          </div>

          <AnimatedPanel delay={0.2} className="grid gap-5 xl:grid-cols-[1.15fr_.85fr]">
            <Card className="rounded-2xl border-border/60 shadow-sm">
              <CardHeader><CardTitle>Faturas por pessoa</CardTitle><CardDescription>Responsabilidade financeira calculada pelas regras das categorias.</CardDescription></CardHeader>
              <CardContent className="grid gap-5 sm:grid-cols-2">{relatorio.porPessoa.map((pessoa) => <div key={pessoa.pessoaId} className="rounded-xl border bg-muted/20 p-4"><div className="mb-2 flex items-center justify-between"><div className="flex items-center gap-2 font-medium"><UserRound className="size-4" />{pessoa.nome}</div><Badge variant="secondary">{currency.format(Number(pessoa.gasto))}</Badge></div><CategoryList items={pessoa.gastosPorCategoria ?? []} emptyMessage="Nenhum gasto atribuído." /></div>)}</CardContent>
            </Card>

            <Card className="rounded-2xl border-border/60 shadow-sm">
              <CardHeader><CardTitle>Fatura total da casa</CardTitle><CardDescription>Categorias ordenadas por maior valor.</CardDescription></CardHeader>
              <CardContent><CategoryList items={[...relatorio.gastosPorCategoria].sort((a, b) => Number(b.total) - Number(a.total))} emptyMessage="Nenhum gasto neste mês." /></CardContent>
            </Card>
          </AnimatedPanel>

          <AnimatedPanel delay={0.28}><Card className="overflow-hidden rounded-2xl border-emerald-200 bg-gradient-to-br from-emerald-50 via-background to-teal-50/70 shadow-lg shadow-emerald-950/5 dark:border-emerald-900 dark:from-emerald-950/40 dark:via-background dark:to-teal-950/30">
            <CardHeader><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"><PiggyBank /></span><div><CardTitle>Guardado do mês</CardTitle><CardDescription>Poupança separada dos gastos comuns.</CardDescription></div></div></CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">{relatorio.porPessoa.map((pessoa) => <div key={pessoa.pessoaId} className="rounded-xl bg-background/80 p-4 ring-1 ring-emerald-200/70 dark:ring-emerald-900"><div className="flex justify-between gap-3"><strong>{pessoa.nome}</strong><strong className="text-emerald-700 dark:text-emerald-300">{currency.format(Number(pessoa.guardado))}</strong></div><CategoryList items={pessoa.guardadoPorCategoria ?? []} emptyMessage="Nada guardado." /></div>)}<div className="rounded-xl bg-emerald-700 p-4 text-white"><p className="text-sm text-emerald-100">Total da casa</p><p className="mt-1 text-2xl font-semibold">{currency.format(Number(relatorio.casa.guardado))}</p><CategoryList items={relatorio.guardadoPorCategoria ?? []} emptyMessage="Nada guardado." inverse /></div></CardContent>
          </Card></AnimatedPanel>

          <AnimatedPanel delay={0.36} className="grid gap-5 xl:grid-cols-[1fr_1.8fr]">
            <Card className="rounded-2xl border-border/60 shadow-sm"><CardHeader><CardTitle>Gastos por categoria</CardTitle><CardDescription>Distribuição do mês, sem poupança.</CardDescription></CardHeader><CardContent><GraficoCategorias dados={relatorio.gastosPorCategoria} /></CardContent></Card>

            <Card className="min-w-0 rounded-2xl border-border/60 shadow-sm">
              <CardHeader className="gap-4"><div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center"><div><CardTitle>Lançamentos do mês</CardTitle><CardDescription>{lancamentos.length} {lancamentos.length === 1 ? "lançamento" : "lançamentos"} em {monthLabel}.</CardDescription></div><Button onClick={openCreate} disabled={categorias.length === 0 || pessoas.length === 0}><Plus /> Novo lançamento</Button></div><div className="flex flex-col gap-2 sm:flex-row"><Select value={filterPessoa} onValueChange={(value) => value && setFilterPessoa(value)}><SelectTrigger className="w-full sm:w-44"><SelectValue>{(value) => value === "todos" ? "Todos os pagadores" : pessoaPorId.get(String(value)) ?? "Pagador"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="todos">Todos os pagadores</SelectItem>{pessoas.map((pessoa) => <SelectItem key={pessoa.id} value={pessoa.id}>{pessoa.nome}</SelectItem>)}</SelectContent></Select><Select value={filterCategoria} onValueChange={(value) => value && setFilterCategoria(value)}><SelectTrigger className="w-full sm:w-48"><SelectValue>{(value) => value === "todas" ? "Todas as categorias" : categoriaPorId.get(String(value)) ?? "Categoria"}</SelectValue></SelectTrigger><SelectContent><SelectItem value="todas">Todas as categorias</SelectItem>{categorias.map((categoria) => <SelectItem key={categoria.id} value={categoria.id}>{categoria.nome}</SelectItem>)}</SelectContent></Select></div></CardHeader>
              <CardContent className="px-0 sm:px-5">
                <div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Descrição</TableHead><TableHead>Categoria</TableHead><TableHead>Valor</TableHead><TableHead>Data</TableHead><TableHead>Pagador</TableHead><TableHead>Status</TableHead><TableHead><span className="sr-only">Ações</span></TableHead></TableRow></TableHeader><TableBody>{filteredLancamentos.length === 0 ? <TableRow><TableCell colSpan={7} className="h-28 text-center text-muted-foreground">Nenhum lançamento para os filtros selecionados.</TableCell></TableRow> : filteredLancamentos.map((item) => <TableRow key={item.id}><TableCell className="min-w-44 font-medium">{item.descricao}</TableCell><TableCell><Badge variant="outline">{item.categoriaNome}</Badge></TableCell><TableCell className="whitespace-nowrap font-medium tabular-nums">{currency.format(Number(item.valor))}</TableCell><TableCell className="whitespace-nowrap">{format(new Date(`${item.data}T12:00:00`), "dd/MM/yyyy")}</TableCell><TableCell className="whitespace-nowrap">{pessoaPorId.get(item.responsavelPagamentoId ?? "") ?? "Não informado"}</TableCell><TableCell><StatusBadge status={item.status} onChange={(status) => void changeStatus(item, status)} /></TableCell><TableCell><div className="flex gap-1"><Button variant="ghost" size="icon-sm" onClick={() => openEdit(item)} aria-label={`Editar ${item.descricao}`}><Pencil /></Button><Button variant="ghost" size="icon-sm" onClick={() => setDeleting(item)} aria-label={`Excluir ${item.descricao}`}><Trash2 /></Button></div></TableCell></TableRow>)}</TableBody></Table></div>
              </CardContent>
            </Card>
          </AnimatedPanel>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg"><DialogHeader><DialogTitle>{editing ? "Editar lançamento" : "Novo lançamento"}</DialogTitle><DialogDescription>{editing ? "Atualize os dados do lançamento selecionado." : "A divisão financeira será aplicada automaticamente pela categoria."}</DialogDescription></DialogHeader><LancamentoForm key={`${editing?.id ?? "new"}-${mes}`} categorias={categorias} pessoas={pessoas} mes={mes} lancamento={editing} onSubmit={saveLancamento} /></DialogContent></Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !isDeleting) setDeleting(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogMedia><Trash2 className="text-destructive" /></AlertDialogMedia><AlertDialogTitle>Excluir “{deleting?.descricao}”?</AlertDialogTitle><AlertDialogDescription>O lançamento será removido dos totais e relatórios deste mês. Essa ação não pode ser desfeita.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={isDeleting} onClick={(event) => { event.preventDefault(); void deleteLancamento(); }}>{isDeleting ? "Excluindo..." : "Excluir lançamento"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
