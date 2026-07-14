"use client";

import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Categoria, Pessoa } from "@/types/categoria";
import type { Lancamento, LancamentoPayload } from "@/types/dashboard";

const schema = z.object({
  categoriaId: z.string().min(1, "Escolha uma categoria."),
  descricao: z.string().trim().min(1, "Informe uma descrição."),
  valor: z.number({ message: "Informe um valor válido." }).min(0, "O valor não pode ser negativo."),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Informe uma data válida."),
  responsavelPagamentoId: z.string().min(1, "Escolha quem pagou."),
  status: z.enum(["PAGO", "PENDENTE"]),
});

type FormValues = z.infer<typeof schema>;

function defaultDate(mes: string) {
  const today = new Date();
  const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  return localToday.startsWith(mes) ? localToday : `${mes}-01`;
}

export function LancamentoForm({ categorias, pessoas, mes, lancamento, onSubmit }: {
  categorias: Categoria[];
  pessoas: Pessoa[];
  mes: string;
  lancamento?: Lancamento | null;
  onSubmit: (payload: LancamentoPayload) => Promise<void>;
}) {
  const defaults: FormValues = {
    categoriaId: lancamento?.categoriaId ?? categorias[0]?.id ?? "",
    descricao: lancamento?.descricao ?? "",
    valor: Number(lancamento?.valor ?? 0),
    data: lancamento?.data ?? defaultDate(mes),
    responsavelPagamentoId: lancamento?.responsavelPagamentoId ?? pessoas[0]?.id ?? "",
    status: lancamento?.status ?? "PENDENTE",
  };
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });

  return (
    <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2"><Label htmlFor="lancamento-descricao">Descrição</Label><Input id="lancamento-descricao" placeholder="Ex.: Mercado da semana" {...register("descricao")} aria-invalid={Boolean(errors.descricao)} />{errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}</div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="lancamento-categoria">Categoria</Label><Controller control={control} name="categoriaId" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="lancamento-categoria" className="w-full"><SelectValue placeholder="Categoria" /></SelectTrigger><SelectContent>{categorias.map((categoria) => <SelectItem key={categoria.id} value={categoria.id}>{categoria.nome}{categoria.ehPoupanca ? " · Poupança" : ""}</SelectItem>)}</SelectContent></Select>} />{errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="lancamento-valor">Valor</Label><div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span><Input id="lancamento-valor" type="number" min="0" step="0.01" className="pl-10" {...register("valor", { valueAsNumber: true })} /></div>{errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="lancamento-data">Data</Label><Input id="lancamento-data" type="date" {...register("data")} />{errors.data && <p className="text-xs text-destructive">{errors.data.message}</p>}</div>
        <div className="space-y-2"><Label htmlFor="lancamento-pagador">Quem pagou</Label><Controller control={control} name="responsavelPagamentoId" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="lancamento-pagador" className="w-full"><SelectValue placeholder="Pessoa" /></SelectTrigger><SelectContent>{pessoas.map((pessoa) => <SelectItem key={pessoa.id} value={pessoa.id}>{pessoa.nome}</SelectItem>)}</SelectContent></Select>} />{errors.responsavelPagamentoId && <p className="text-xs text-destructive">{errors.responsavelPagamentoId.message}</p>}</div>
      </div>
      <div className="space-y-2"><Label htmlFor="lancamento-status">Status</Label><Controller control={control} name="status" render={({ field }) => <Select value={field.value} onValueChange={field.onChange}><SelectTrigger id="lancamento-status" className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="PENDENTE">Pendente</SelectItem><SelectItem value="PAGO">Pago</SelectItem></SelectContent></Select>} /></div>
      <DialogFooter><DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose><Button type="submit" disabled={isSubmitting || categorias.length === 0 || pessoas.length === 0}>{isSubmitting && <LoaderCircle className="animate-spin" />}{lancamento ? "Salvar alterações" : "Criar lançamento"}</Button></DialogFooter>
    </form>
  );
}
