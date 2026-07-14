"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Equal, MoreHorizontal, Pencil, Percent, PiggyBank, Plus, Tags, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { CategoriaForm } from "@/components/categorias/categoria-form";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogMedia, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api-client";
import type { Categoria, CategoriaPayload, Pessoa } from "@/types/categoria";

function LoadingGrid() {
  return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 6 }).map((_, index) => <Skeleton key={index} className="h-44 rounded-xl" />)}</div>;
}

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Categoria | null>(null);
  const [deleting, setDeleting] = useState<Categoria | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const pessoasPorId = useMemo(() => new Map(pessoas.map((pessoa) => [pessoa.id, pessoa.nome])), [pessoas]);

  const loadData = useCallback(async () => {
    try {
      const [categoriasResponse, pessoasResponse] = await Promise.all([
        apiClient.get<Categoria[]>("/categorias"),
        apiClient.get<Pessoa[]>("/pessoas"),
      ]);
      setCategorias(categoriasResponse);
      setPessoas(pessoasResponse);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { void loadData(); }, [loadData]);

  function openCreate() {
    setEditing(null);
    setDialogOpen(true);
  }

  function openEdit(categoria: Categoria) {
    setEditing(categoria);
    setDialogOpen(true);
  }

  async function saveCategoria(payload: CategoriaPayload) {
    if (editing) {
      const updated = await apiClient.patch<Categoria>(`/categorias/${editing.id}`, payload);
      setCategorias((current) => current.map((categoria) => categoria.id === updated.id ? updated : categoria));
      toast.success("Categoria atualizada.");
    } else {
      const created = await apiClient.post<Categoria>("/categorias", payload);
      setCategorias((current) => [...current, created].sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR")));
      toast.success("Categoria criada.");
    }
    setDialogOpen(false);
  }

  async function deleteCategoria() {
    if (!deleting) return;
    setIsDeleting(true);
    try {
      await apiClient.delete<void>(`/categorias/${deleting.id}`);
      setCategorias((current) => current.filter((categoria) => categoria.id !== deleting.id));
      toast.success("Categoria excluída.");
      setDeleting(null);
    } finally {
      setIsDeleting(false);
    }
  }

  function getRule(categoria: Categoria) {
    if (categoria.tipoDivisao === "VALOR_FIXO_DIVIDIDO") return { label: "Divisão igual", icon: Equal, detail: "Dividido igualmente entre as pessoas" };
    if (categoria.tipoDivisao === "FIXO_POR_PESSOA") return { label: `${pessoasPorId.get(categoria.responsavelId ?? "") ?? "Pessoa"} 100%`, icon: UserRound, detail: "Responsabilidade integral" };
    const detail = categoria.divisoesPercentuais.map((divisao) => `${pessoasPorId.get(divisao.pessoaId) ?? "Pessoa"} ${Number(divisao.percentual).toLocaleString("pt-BR")}%`).join(" · ");
    return { label: "Percentual", icon: Percent, detail };
  }

  return (
    <section>
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-1 text-sm font-medium text-primary">Organização</p>
          <h1 className="text-3xl font-semibold tracking-tight">Categorias</h1>
          <p className="mt-2 text-muted-foreground">Defina como cada tipo de gasto ou valor guardado é dividido.</p>
        </div>
        <Button onClick={openCreate} disabled={isLoading || pessoas.length === 0} className="w-full sm:w-auto">
          <Plus /> Nova categoria
        </Button>
      </div>

      {!isLoading && pessoas.length === 0 && (
        <Card className="mb-6 border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950">
          <CardContent className="text-sm text-amber-800 dark:text-amber-200">Cadastre ao menos uma pessoa na casa antes de criar categorias.</CardContent>
        </Card>
      )}

      {isLoading ? <LoadingGrid /> : categorias.length === 0 ? (
        <div className="grid min-h-80 place-items-center rounded-2xl border border-dashed bg-background p-8 text-center">
          <div>
            <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground"><Tags className="size-6" /></span>
            <h2 className="font-medium">Nenhuma categoria ainda</h2>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">Crie categorias para organizar os lançamentos e configurar a divisão da casa.</p>
            <Button className="mt-5" onClick={openCreate} disabled={pessoas.length === 0}><Plus /> Criar primeira categoria</Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {categorias.map((categoria) => {
            const rule = getRule(categoria);
            const RuleIcon = rule.icon;
            return (
              <Card key={categoria.id} className="group transition-shadow hover:shadow-md">
                <CardHeader className="flex-row items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      {categoria.ehPoupanca && <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><PiggyBank /> Poupança</Badge>}
                      <Badge variant="outline"><RuleIcon /> {rule.label}</Badge>
                    </div>
                    <CardTitle className="truncate text-lg">{categoria.nome}</CardTitle>
                    <CardDescription className="mt-1 min-h-10">{rule.detail}</CardDescription>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon-sm" onClick={() => openEdit(categoria)} aria-label={`Editar ${categoria.nome}`}><Pencil /></Button>
                    <Button variant="ghost" size="icon-sm" onClick={() => setDeleting(categoria)} aria-label={`Excluir ${categoria.nome}`}><Trash2 /></Button>
                  </div>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MoreHorizontal className="size-4" /> Aplicada automaticamente aos lançamentos
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[calc(100vh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            <DialogDescription>{editing ? "Atualize o nome e a regra aplicada aos lançamentos." : "Configure como os valores desta categoria serão classificados e divididos."}</DialogDescription>
          </DialogHeader>
          <CategoriaForm key={editing?.id ?? "new"} pessoas={pessoas} categoria={editing} onSubmit={saveCategoria} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => { if (!open && !isDeleting) setDeleting(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia><Trash2 className="text-destructive" /></AlertDialogMedia>
            <AlertDialogTitle>Excluir “{deleting?.nome}”?</AlertDialogTitle>
            <AlertDialogDescription>Essa ação não pode ser desfeita. Categorias vinculadas a lançamentos ou contas fixas não podem ser excluídas.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={isDeleting} onClick={(event) => { event.preventDefault(); void deleteCategoria(); }}>{isDeleting ? "Excluindo..." : "Excluir categoria"}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
