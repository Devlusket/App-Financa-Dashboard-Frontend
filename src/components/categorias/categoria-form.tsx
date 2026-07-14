"use client";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, PiggyBank } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import type { Categoria, CategoriaPayload, Pessoa, TipoDivisao } from "@/types/categoria";

const schema = z.object({
  nome: z.string().trim().min(1, "Informe o nome da categoria."),
  tipoDivisao: z.enum(["FIXO_POR_PESSOA", "PERCENTUAL", "VALOR_FIXO_DIVIDIDO"]),
  responsavelId: z.string(),
  ehPoupanca: z.boolean(),
  percentuais: z.record(z.string(), z.number().min(0, "Use um valor positivo.").max(100, "O máximo é 100%.")),
}).superRefine((data, context) => {
  if (data.tipoDivisao === "FIXO_POR_PESSOA" && !data.responsavelId) {
    context.addIssue({ code: "custom", path: ["responsavelId"], message: "Escolha a pessoa responsável." });
  }

  if (data.tipoDivisao === "PERCENTUAL") {
    const total = Object.values(data.percentuais).reduce((sum, value) => sum + (Number.isFinite(value) ? value : 0), 0);
    if (Math.abs(total - 100) > 0.001) {
      context.addIssue({ code: "custom", path: ["percentuais"], message: "A soma dos percentuais deve ser exatamente 100%." });
    }
  }
});

type CategoriaFormValues = z.infer<typeof schema>;

type CategoriaFormProps = {
  pessoas: Pessoa[];
  categoria?: Categoria | null;
  onSubmit: (payload: CategoriaPayload) => Promise<void>;
};

function getDefaultValues(pessoas: Pessoa[], categoria?: Categoria | null): CategoriaFormValues {
  const percentualInicial = pessoas.length ? 100 / pessoas.length : 0;
  return {
    nome: categoria?.nome ?? "",
    tipoDivisao: categoria?.tipoDivisao ?? "VALOR_FIXO_DIVIDIDO",
    responsavelId: categoria?.responsavelId ?? pessoas[0]?.id ?? "",
    ehPoupanca: categoria?.ehPoupanca ?? false,
    percentuais: Object.fromEntries(pessoas.map((pessoa) => [
      pessoa.id,
      categoria?.divisoesPercentuais.find((divisao) => divisao.pessoaId === pessoa.id)?.percentual ?? percentualInicial,
    ])),
  };
}

export function CategoriaForm({ pessoas, categoria, onSubmit }: CategoriaFormProps) {
  const { control, register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<CategoriaFormValues>({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(pessoas, categoria),
  });
  const tipoDivisao = useWatch({ control, name: "tipoDivisao" });
  const percentuais = useWatch({ control, name: "percentuais" });
  const totalPercentual = Object.values(percentuais ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0);

  useEffect(() => {
    reset(getDefaultValues(pessoas, categoria));
  }, [categoria, pessoas, reset]);

  async function submit(values: CategoriaFormValues) {
    const payload: CategoriaPayload = {
      nome: values.nome.trim(),
      tipoDivisao: values.tipoDivisao as TipoDivisao,
      responsavelId: values.tipoDivisao === "FIXO_POR_PESSOA" ? values.responsavelId : null,
      ehPoupanca: values.ehPoupanca,
      divisoesPercentuais: values.tipoDivisao === "PERCENTUAL"
        ? pessoas.map((pessoa) => ({ pessoaId: pessoa.id, percentual: values.percentuais[pessoa.id] }))
        : [],
    };
    await onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="categoria-nome">Nome</Label>
        <Input id="categoria-nome" placeholder="Ex.: Mercado" {...register("nome")} aria-invalid={Boolean(errors.nome)} />
        {errors.nome && <p className="text-xs text-destructive">{errors.nome.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="tipo-divisao">Regra de divisão</Label>
        <Controller
          control={control}
          name="tipoDivisao"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="tipo-divisao" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="VALOR_FIXO_DIVIDIDO">Dividir igualmente</SelectItem>
                <SelectItem value="FIXO_POR_PESSOA">100% de uma pessoa</SelectItem>
                <SelectItem value="PERCENTUAL">Percentuais personalizados</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
        <p className="text-xs text-muted-foreground">A regra será aplicada automaticamente aos lançamentos desta categoria.</p>
      </div>

      {tipoDivisao === "FIXO_POR_PESSOA" && (
        <div className="space-y-2 rounded-xl border bg-muted/30 p-4">
          <Label htmlFor="pessoa-responsavel">Pessoa responsável</Label>
          <Controller
            control={control}
            name="responsavelId"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="pessoa-responsavel" className="w-full"><SelectValue placeholder="Selecione uma pessoa" /></SelectTrigger>
                <SelectContent>{pessoas.map((pessoa) => <SelectItem key={pessoa.id} value={pessoa.id}>{pessoa.nome}</SelectItem>)}</SelectContent>
              </Select>
            )}
          />
          {errors.responsavelId && <p className="text-xs text-destructive">{errors.responsavelId.message}</p>}
        </div>
      )}

      {tipoDivisao === "PERCENTUAL" && (
        <div className="space-y-3 rounded-xl border bg-muted/30 p-4">
          <div className="flex items-center justify-between">
            <Label>Percentual por pessoa</Label>
            <span className={totalPercentual === 100 ? "text-xs font-medium text-emerald-600" : "text-xs font-medium text-destructive"}>{totalPercentual.toLocaleString("pt-BR")}% de 100%</span>
          </div>
          {pessoas.map((pessoa) => (
            <div key={pessoa.id} className="grid grid-cols-[1fr_112px] items-center gap-3">
              <Label htmlFor={`percentual-${pessoa.id}`} className="font-normal">{pessoa.nome}</Label>
              <div className="relative">
                <Input id={`percentual-${pessoa.id}`} type="number" min="0" max="100" step="0.01" className="pr-8" {...register(`percentuais.${pessoa.id}`, { valueAsNumber: true })} />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
              </div>
            </div>
          ))}
          {typeof errors.percentuais?.message === "string" && <p className="text-xs text-destructive">{errors.percentuais.message}</p>}
        </div>
      )}

      <Separator />
      <Controller
        control={control}
        name="ehPoupanca"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-4 rounded-xl border p-4">
            <div className="flex gap-3">
              <PiggyBank className="mt-0.5 size-5 text-muted-foreground" />
              <div>
                <Label htmlFor="eh-poupanca">Categoria de poupança</Label>
                <p className="mt-1 text-xs text-muted-foreground">Valores serão contabilizados como dinheiro guardado, não como gasto.</p>
              </div>
            </div>
            <Switch id="eh-poupanca" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={isSubmitting || pessoas.length === 0}>
          {isSubmitting && <LoaderCircle className="animate-spin" />}
          {categoria ? "Salvar alterações" : "Criar categoria"}
        </Button>
      </DialogFooter>
    </form>
  );
}
