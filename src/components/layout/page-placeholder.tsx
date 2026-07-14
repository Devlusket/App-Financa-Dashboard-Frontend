import type { LucideIcon } from "lucide-react";

export function PagePlaceholder({ title, description, icon: Icon }: { title: string; description: string; icon: LucideIcon }) {
  return (
    <section>
      <div className="mb-8">
        <p className="mb-1 text-sm font-medium text-primary">Finança da casa</p>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-2 text-muted-foreground">{description}</p>
      </div>
      <div className="grid min-h-72 place-items-center rounded-2xl border border-dashed bg-background p-8 text-center">
        <div>
          <span className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-muted text-muted-foreground">
            <Icon className="size-6" />
          </span>
          <p className="font-medium">Estrutura pronta</p>
          <p className="mt-1 max-w-sm text-sm text-muted-foreground">O conteúdo desta página será implementado na fase correspondente da checklist.</p>
        </div>
      </div>
    </section>
  );
}
