"use client";

import { useEffect } from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AuthenticatedError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);

  return (
    <div className="grid min-h-[60vh] place-items-center rounded-2xl border border-dashed bg-background p-8 text-center">
      <div>
        <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive"><AlertTriangle /></span>
        <h1 className="text-xl font-semibold">Não foi possível abrir esta página</h1>
        <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Tente carregar novamente. Se o problema continuar, confirme se o backend está disponível.</p>
        <Button className="mt-5" onClick={reset}><RotateCcw /> Tentar novamente</Button>
      </div>
    </div>
  );
}
