"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, Plus } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { DialogClose, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  descricao: z.string().trim().min(1, "Informe uma descrição."),
  valor: z.number({ message: "Informe um valor válido." }).min(0, "O valor não pode ser negativo."),
});

export type AdicionalFormValues = z.infer<typeof schema>;

export function AdicionalForm({ onSubmit }: { onSubmit: (values: AdicionalFormValues) => Promise<void> }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AdicionalFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { descricao: "", valor: 0 },
  });

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-2">
        <Label htmlFor="adicional-descricao">Descrição</Label>
        <Input id="adicional-descricao" placeholder="Ex.: Freelance" {...register("descricao")} aria-invalid={Boolean(errors.descricao)} />
        {errors.descricao && <p className="text-xs text-destructive">{errors.descricao.message}</p>}
      </div>
      <div className="space-y-2">
        <Label htmlFor="adicional-valor">Valor</Label>
        <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">R$</span><Input id="adicional-valor" type="number" min="0" step="0.01" className="pl-10" {...register("valor", { valueAsNumber: true })} aria-invalid={Boolean(errors.valor)} /></div>
        {errors.valor && <p className="text-xs text-destructive">{errors.valor.message}</p>}
      </div>
      <DialogFooter>
        <DialogClose render={<Button type="button" variant="outline" />}>Cancelar</DialogClose>
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <LoaderCircle className="animate-spin" /> : <Plus />} Adicionar renda</Button>
      </DialogFooter>
    </form>
  );
}
