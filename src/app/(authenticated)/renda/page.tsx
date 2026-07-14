"use client";

import { useEffect, useMemo, useState } from "react";
import { format, parse, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, Sparkles, Trash2, UserRound, Wallet } from "lucide-react";
import { toast } from "sonner";
import { AdicionalForm, type AdicionalFormValues } from "@/components/renda/adicional-form";
import { RendaFixaForm } from "@/components/renda/renda-fixa-form";
import { SeletorMes } from "@/components/shared/seletor-mes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import type { Pessoa } from "@/types/categoria";
import type { RendaAdicional, RendaConsulta } from "@/types/renda";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function RendaPage() {
  const [mes, setMes] = useState(() => format(new Date(), "yyyy-MM"));
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [pessoaId, setPessoaId] = useState("");
  const [renda, setRenda] = useState<RendaConsulta | null>(null);
  const [isLoadingPessoas, setIsLoadingPessoas] = useState(true);
  const [isLoadingRenda, setIsLoadingRenda] = useState(false);
  const [adicionalOpen, setAdicionalOpen] = useState(false);
  const [deletingAdicionalId, setDeletingAdicionalId] = useState<string | null>(null);

  useEffect(() => {
    apiClient.get<Pessoa[]>("/pessoas").then((response) => {
      setPessoas(response);
      setPessoaId((current) => current || response[0]?.id || "");
    }).finally(() => setIsLoadingPessoas(false));
  }, []);

  useEffect(() => {
    if (!pessoaId) return;
    let cancelled = false;
    const requestStart = window.setTimeout(() => {
      setIsLoadingRenda(true);
      apiClient.get<RendaConsulta>(`/rendas?pessoaId=${encodeURIComponent(pessoaId)}&mes=${mes}`)
        .then((response) => { if (!cancelled) setRenda(response); })
        .finally(() => { if (!cancelled) setIsLoadingRenda(false); });
    }, 0);

    return () => {
      cancelled = true;
      window.clearTimeout(requestStart);
    };
  }, [mes, pessoaId]);

  const pessoa = pessoas.find((item) => item.id === pessoaId);
  const totalAdicionais = useMemo(() => renda?.adicionais.reduce((sum, item) => sum + Number(item.valor), 0) ?? 0, [renda]);
  const totalRenda = Number(renda?.valorFixo ?? 0) + totalAdicionais;
  const mesAnterior = format(subMonths(parse(`${mes}-01`, "yyyy-MM-dd", new Date()), 1), "MMMM 'de' yyyy", { locale: ptBR });

  async function saveRenda(valorFixo: number) {
    const response = renda?.existe && renda.id
      ? await apiClient.patch<RendaConsulta>(`/rendas/${renda.id}`, { valorFixo })
      : await apiClient.post<RendaConsulta>("/rendas", { pessoaId, mesReferencia: mes, valorFixo });
    setRenda(response);
    toast.success(renda?.existe ? "Renda fixa atualizada." : "Renda mensal cadastrada.");
  }

  async function addAdicional(values: AdicionalFormValues) {
    if (!renda?.id) return;
    const created = await apiClient.post<RendaAdicional>(`/rendas/${renda.id}/adicionais`, { descricao: values.descricao.trim(), valor: values.valor });
    setRenda((current) => current ? { ...current, adicionais: [...current.adicionais, created] } : current);
    setAdicionalOpen(false);
    toast.success("Renda adicional incluída.");
  }

  async function deleteAdicional(id: string) {
    setDeletingAdicionalId(id);
    try {
      await apiClient.delete<void>(`/rendas/adicionais/${id}`);
      setRenda((current) => current ? { ...current, adicionais: current.adicionais.filter((item) => item.id !== id) } : current);
      toast.success("Renda adicional removida.");
    } finally {
      setDeletingAdicionalId(null);
    }
  }

  return (
    <section>
      <div className="mb-7">
        <p className="mb-1 text-sm font-medium text-primary">Entradas do mês</p>
        <h1 className="text-3xl font-semibold tracking-tight">Renda</h1>
        <p className="mt-2 text-muted-foreground">Cadastre a renda fixa e os valores adicionais de cada pessoa.</p>
      </div>

      <Card className="mb-6">
        <CardContent className="grid gap-4 pt-5 sm:grid-cols-2 sm:items-end">
          <div className="space-y-1.5">
            <label htmlFor="pessoa-renda" className="text-xs text-muted-foreground">Pessoa</label>
            {isLoadingPessoas ? <Skeleton className="h-8 w-full" /> : (
              <Select value={pessoaId} onValueChange={(value) => { if (value) setPessoaId(value); }} disabled={pessoas.length === 0}>
                <SelectTrigger id="pessoa-renda" className="w-full"><UserRound /><SelectValue placeholder="Selecione uma pessoa" /></SelectTrigger>
                <SelectContent>{pessoas.map((item) => <SelectItem key={item.id} value={item.id}>{item.nome}</SelectItem>)}</SelectContent>
              </Select>
            )}
          </div>
          <SeletorMes value={mes} onChange={setMes} />
        </CardContent>
      </Card>

      {!isLoadingPessoas && pessoas.length === 0 ? (
        <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed p-8 text-center"><div><UserRound className="mx-auto mb-4 size-10 text-muted-foreground" /><h2 className="font-medium">Nenhuma pessoa cadastrada</h2><p className="mt-1 text-sm text-muted-foreground">Cadastre uma pessoa na casa para informar a renda.</p></div></div>
      ) : isLoadingRenda || !renda ? (
        <div className="grid gap-4 lg:grid-cols-[1.05fr_.95fr]"><Skeleton className="h-80 rounded-xl" /><Skeleton className="h-80 rounded-xl" /></div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[1.05fr_.95fr]">
          <Card>
            <CardHeader><div className="flex items-start justify-between gap-3"><div><CardTitle>Renda fixa de {pessoa?.nome}</CardTitle><CardDescription>{renda.existe ? "Valor cadastrado para o mês selecionado." : "Ainda não há renda cadastrada neste mês."}</CardDescription></div><Badge variant={renda.existe ? "secondary" : "outline"}>{renda.existe ? "Cadastrada" : "Pendente"}</Badge></div></CardHeader>
            <CardContent><RendaFixaForm valor={renda.valorFixo} sugestao={renda.valorFixoSugerido} mesAnterior={mesAnterior} existe={renda.existe} onSubmit={saveRenda} /></CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary text-primary-foreground">
            <CardHeader><CardDescription className="text-primary-foreground/70">Renda total no mês</CardDescription><CardTitle className="text-3xl tabular-nums">{currency.format(totalRenda)}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm"><div className="flex justify-between"><span className="text-primary-foreground/70">Renda fixa</span><strong>{currency.format(Number(renda.valorFixo ?? 0))}</strong></div><div className="flex justify-between"><span className="text-primary-foreground/70">Adicionais</span><strong>{currency.format(totalAdicionais)}</strong></div></CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader className="flex-row items-center justify-between gap-4"><div><CardTitle>Rendas adicionais</CardTitle><CardDescription>Freelances, horas extras e outras entradas deste mês.</CardDescription></div><Button onClick={() => setAdicionalOpen(true)} disabled={!renda.existe}><Plus /> <span className="hidden sm:inline">Adicionar</span></Button></CardHeader>
            <CardContent>
              {!renda.existe ? <div className="rounded-xl border border-dashed p-6 text-center text-sm text-muted-foreground">Cadastre primeiro a renda fixa deste mês para adicionar outros valores.</div> : renda.adicionais.length === 0 ? <div className="rounded-xl border border-dashed p-6 text-center"><Sparkles className="mx-auto mb-2 size-5 text-muted-foreground" /><p className="text-sm text-muted-foreground">Nenhuma renda adicional neste mês.</p></div> : (
                <div className="divide-y">{renda.adicionais.map((adicional) => <div key={adicional.id} className="flex items-center justify-between gap-4 py-3"><div className="flex min-w-0 items-center gap-3"><span className="grid size-9 shrink-0 place-items-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><Wallet className="size-4" /></span><div className="min-w-0"><p className="truncate font-medium">{adicional.descricao}</p><p className="text-xs text-muted-foreground">Entrada adicional</p></div></div><div className="flex items-center gap-2"><strong className="whitespace-nowrap tabular-nums">{currency.format(Number(adicional.valor))}</strong><Button variant="ghost" size="icon-sm" onClick={() => void deleteAdicional(adicional.id)} disabled={deletingAdicionalId === adicional.id} aria-label={`Excluir ${adicional.descricao}`}><Trash2 /></Button></div></div>)}</div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Dialog open={adicionalOpen} onOpenChange={setAdicionalOpen}><DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Nova renda adicional</DialogTitle><DialogDescription>Inclua uma entrada extra para {pessoa?.nome} no mês selecionado.</DialogDescription></DialogHeader><AdicionalForm onSubmit={addAdicional} /></DialogContent></Dialog>
    </section>
  );
}
