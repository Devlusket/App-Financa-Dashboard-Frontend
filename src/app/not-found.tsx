import Link from "next/link";
import { ArrowLeft, SearchX } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-muted/30 p-4 text-center">
      <div><span className="mx-auto mb-4 grid size-14 place-items-center rounded-2xl bg-background text-muted-foreground shadow-sm"><SearchX /></span><p className="text-sm font-medium text-primary">Erro 404</p><h1 className="mt-1 text-3xl font-semibold">Página não encontrada</h1><p className="mt-2 text-muted-foreground">O endereço informado não existe neste sistema.</p><Button className="mt-6" nativeButton={false} render={<Link href="/dashboard" />}><ArrowLeft /> Voltar ao dashboard</Button></div>
    </main>
  );
}
