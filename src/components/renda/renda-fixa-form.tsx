"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Copy, LoaderCircle } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  valorFixo: z.number({ message: "Informe um valor válido." }).min(0, "O valor não pode ser negativo."),
});

type FormValues = z.infer<typeof schema>;

export function RendaFixaForm({ valor, sugestao, mesAnterior, existe, onSubmit }: {
  valor: number | null;
  sugestao: number | null;
  mesAnterior: string;
  existe: boolean;
  onSubmit: (valor: number) => Promise<void>;
}) {
  const { register, handleSubmit, reset, setValue, formState: { errors, isSubmitting } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { valorFixo: valor ?? 0 },
  });

  useEffect(() => { reset({ valorFixo: valor ?? 0 }); }, [reset, valor]);

  return (
    <form onSubmit={handleSubmit(({ valorFixo }) => onSubmit(valorFixo))} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="valor-fixo">Valor fixo mensal</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span>
          <Input id="valor-fixo" type="number" min="0" step="0.01" className="h-11 pl-10 text-lg" {...register("valorFixo", { valueAsNumber: true })} aria-invalid={Boolean(errors.valorFixo)} />
        </div>
        {errors.valorFixo && <p className="text-xs text-destructive">{errors.valorFixo.message}</p>}
      </div>

      {sugestao !== null && !existe && (
        <Button type="button" variant="outline" className="w-full justify-start" onClick={() => setValue("valorFixo", Number(sugestao), { shouldValidate: true })}>
          <Copy /> Usar valor de {mesAnterior}
        </Button>
      )}

      <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
        {isSubmitting ? <LoaderCircle className="animate-spin" /> : <Check />}
        {existe ? "Atualizar renda fixa" : "Cadastrar renda do mês"}
      </Button>
    </form>
  );
}
