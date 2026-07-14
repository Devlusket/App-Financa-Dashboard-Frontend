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
import type { Categoria } from "@/types/categoria";
import type { ContaFixaPayload } from "@/types/conta-fixa";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da conta."),
  categoriaId: z.string().min(1, "Escolha uma categoria."),
  valorAtual: z.number({ message: "Informe um valor válido." }).min(0, "O valor não pode ser negativo."),
});

type FormValues = z.infer<typeof schema>;

export function ContaFixaForm({ categorias, onSubmit }: { categorias: Categoria[]; onSubmit: (payload: ContaFixaPayload) => Promise<void> }) {
  const { control, register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { nome: "", categoriaId: categorias[0]?.id ?? "", valorAtual: 0 },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="conta-nome">Nome da conta</Label>
        <Input id="conta-nome" placeholder="Ex.: Energia elétrica" {...register("nome")} aria-invalid={Boolean(errors.nome)} />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="conta-categoria">Categoria vinculada</Label>
        <Controller
          control={control}
          name="categoriaId"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger id="conta-categoria" className="w-full"><SelectValue placeholder="Escolha uma categoria">{(value) => categorias.find((categoria) => categoria.id === value)?.nome ?? "Escolha uma categoria"}</SelectValue></SelectTrigger>
              <SelectContent>{categorias.map((categoria) => <SelectItem key={categoria.id} value={categoria.id}>{categoria.nome}</SelectItem>)}</SelectContent>
            </Select>
          )}
        />
        {errors.categoriaId && <p className="text-xs text-destructive">{errors.categoriaId.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="conta-valor">Valor atual</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
          <Input id="conta-valor" type="number" min="0" step="0.01" className="pl-10" {...register("valorAtual", { valueAsNumber: true })} aria-invalid={Boolean(errors.valorAtual)} />
        </div>
        {errors.valorAtual && <p className="text-xs text-destructive">{errors.valorAtual.message}</p>}
      </div>

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={isSubmitting || categorias.length === 0}>
          {isSubmitting && <LoaderCircle className="animate-spin" />} Criar conta fixa
        </Button>
      </DialogFooter>
    </form>
  );
}
