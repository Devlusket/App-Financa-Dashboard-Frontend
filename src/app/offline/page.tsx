import Link from "next/link";
import { RefreshCw, WifiOff } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function OfflinePage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-gradient-to-br from-emerald-50 via-background to-teal-50 p-6 dark:from-emerald-950/30 dark:to-background">
      <div className="w-full max-w-md rounded-3xl border bg-background/90 p-8 text-center shadow-xl backdrop-blur">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"><WifiOff className="size-7" /></span>
        <h1 className="mt-5 text-2xl font-semibold tracking-tight">Você está sem conexão</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">Seus dados financeiros não ficam salvos no aparelho. Reconecte-se para consultar e atualizar as informações com segurança.</p>
        <Link href="/dashboard" className={cn(buttonVariants(), "mt-6 w-full")}><RefreshCw className="size-4" /> Tentar novamente</Link>
      </div>
    </main>
  );
}
