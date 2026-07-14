"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Check, Pencil, Plus, ReceiptText, RotateCcw, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { ContaFixaForm } from "@/components/contas-fixas/conta-fixa-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import type { Categoria } from "@/types/categoria";
import type { ContaFixa, ContaFixaPayload } from "@/types/conta-fixa";

const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default function ContasFixasPage() {
  const [contas, setContas] = useState<ContaFixa[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<ContaFixa | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const categoriaPorId = useMemo(() => new Map(categorias.map((categoria) => [categoria.id, categoria])), [categorias]);

  const loadData = useCallback(async () => {
    try {
      const [contasResponse, categoriasResponse] = await Promise.all([
        apiClient.get<ContaFixa[]>("/contas-fixas"),
        apiClient.get<Categoria[]>("/categorias"),
      ]);
      setContas(contasResponse);
      setCategorias(categoriasResponse);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  async function createConta(payload: ContaFixaPayload) {
    const created = await apiClient.post<ContaFixa>("/contas-fixas", payload);
    setContas((current) => [...current, created].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
    setDialogOpen(false);
    toast.success("Conta fixa criada.");
  }

  function startEditing(conta: ContaFixa) {
    setEditingId(conta.id);
    setEditingValue(String(Number(conta.valorAtual)));
  }

  async function saveValue(conta: ContaFixa) {
    const value = Number(editingValue);
    if (!Number.isFinite(value) || value < 0) {
      toast.error("Informe um valor válido.");
      return;
    }
    setSavingId(conta.id);
    try {
      const updated = await apiClient.patch<ContaFixa>(`/contas-fixas/${conta.id}`, { valorAtual: value });
      setContas((current) => current.map((item) => item.id === updated.id ? updated : item));
      setEditingId(null);
      toast.success("Valor atualizado.");
    } finally {
      setSavingId(null);
    }
  }

  async function deleteConta() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await apiClient.delete<void>(`/contas-fixas/${deleting.id}`);
      setContas((current) => current.filter((conta) => conta.id !== deleting.id));
      setDeleting(null);
      toast.success("Conta fixa excluída.");
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section>
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Referências mensais</p>
          <h1 className="text-3xl font-semibold tracking-tight">Contas fixas</h1>
          <p className="mt-2 text-muted-foreground">Mantenha à mão os valores recorrentes da casa.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} disabled={isLoading || categorias.length === 0} className="w-full sm:w-auto"><Plus /> Nova conta fixa</Button>
      </div>

      <div className="mb-7 flex gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        <RotateCcw className="mt-0.5 size-5 shrink-0" />
        <p><strong>Somente referência:</strong> contas fixas não criam nem alteram lançamentos automaticamente.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-48 rounded-xl" />)}</div>
      ) : categorias.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-background p-8 text-center">
          <div><Tag className="mx-auto mb-4 size-10 text-muted-foreground" /><h2 className="font-medium">Crie uma categoria primeiro</h2><p className="mt-1 text-sm text-muted-foreground">Toda conta fixa precisa estar vinculada a uma categoria.</p><Button className="mt-5" nativeButton={false} render={<Link href="/categorias" />}>Ir para categorias</Button></div>
        </div>
      ) : contas.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-background p-8 text-center">
          <div><ReceiptText className="mx-auto mb-4 size-10 text-muted-foreground" /><h2 className="font-medium">Nenhuma conta fixa ainda</h2><p className="mt-1 text-sm text-muted-foreground">Cadastre suas referências recorrentes para consultar os valores rapidamente.</p><Button className="mt-5" onClick={() => setDialogOpen(true)}><Plus /> Criar primeira conta</Button></div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {contas.map((conta) => {
            const categoria = categoriaPorId.get(conta.categoriaId);
            const editing = editingId === conta.id;
            return (
              <Card key={conta.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0"><Badge variant="outline" className="mb-3"><Tag /> {categoria?.nome ?? "Categoria"}</Badge><CardTitle className="truncate text-lg">{conta.nome}</CardTitle><CardDescription>Valor de referência atual</CardDescription></div>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(conta)} aria-label={`Excluir ${conta.nome}`}><Trash2 /></Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <div className="flex items-center gap-2">
                      <div className="relative flex-1"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span><Input aria-label={`Novo valor de ${conta.nome}`} type="number" min="0" step="0.01" value={editingValue} onChange={(event) => setEditingValue(event.target.value)} className="pl-10" autoFocus /></div>
                      <Button size="icon" onClick={() => void saveValue(conta)} disabled={savingId === conta.id} aria-label="Salvar valor"><Check /></Button>
                      <Button size="icon" variant="ghost" onClick={() => setEditingId(null)} aria-label="Cancelar edição"><X /></Button>
                    </div>
                  ) : <p className="text-2xl font-semibold tabular-nums">{currency.format(Number(conta.valorAtual))}</p>}
                </CardContent>
                <CardFooter><Button variant="ghost" size="sm" onClick={() => startEditing(conta)} disabled={editing}><Pencil /> Editar valor</Button></CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-md"><DialogHeader><DialogTitle>Nova conta fixa</DialogTitle><DialogDescription>Cadastre uma referência. Isso não gera um lançamento automático.</DialogDescription></DialogHeader><ContaFixaForm categorias={categorias} onSubmit={createConta} /></DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !isDeleting) setDeleting(null); }}>
        <AlertDialogContent><AlertDialogHeader><AlertDialogMedia><Trash2 className="text-destructive" /></AlertDialogMedia><AlertDialogTitle>Excluir “{deleting?.nome}”?</AlertDialogTitle><AlertDialogDescription>A referência será removida. Nenhum lançamento será alterado.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel><AlertDialogAction variant="destructive" disabled={isDeleting} onClick={(event) => { event.preventDefault(); void deleteConta(); }}>{isDeleting ? "Excluindo..." : "Excluir conta"}</AlertDialogAction></AlertDialogFooter></AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
