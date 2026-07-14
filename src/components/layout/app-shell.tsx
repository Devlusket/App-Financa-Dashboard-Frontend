"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BarChart3, CircleDollarSign, LayoutDashboard, LogOut, ReceiptText, Tags, WalletCards } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { cn } from "@/lib/utils";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/categorias", label: "Categorias", icon: Tags },
  { href: "/contas-fixas", label: "Contas fixas", icon: ReceiptText },
  { href: "/renda", label: "Renda", icon: CircleDollarSign },
  { href: "/relatorios", label: "Relatórios", icon: BarChart3 },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-muted/25 md:grid md:grid-cols-[248px_1fr]">
      <aside className="hidden border-r bg-background md:flex md:h-screen md:flex-col md:sticky md:top-0">
        <Link href="/dashboard" className="flex h-20 items-center gap-3 border-b px-6">
          <span className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground">
            <WalletCards className="size-5" />
          </span>
          <span>
            <strong className="block text-lg leading-tight">Finança</strong>
            <small className="text-muted-foreground">Nossa casa</small>
          </span>
        </Link>

        <nav className="flex flex-1 flex-col gap-1 p-3" aria-label="Navegação principal">
          {navigation.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="size-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t p-3">
          <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={logout}>
            <LogOut className="size-4" />
            Sair
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
              <WalletCards className="size-5" /> Finança
            </Link>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
              <LogOut className="size-5" />
            </Button>
          </div>
          <nav className="flex gap-1 overflow-x-auto px-2 pb-2" aria-label="Navegação principal">
            {navigation.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex shrink-0 items-center gap-2 rounded-md px-3 py-2 text-xs font-medium",
                  pathname === href ? "bg-primary text-primary-foreground" : "text-muted-foreground",
                )}
              >
                <Icon className="size-4" /> {label}
              </Link>
            ))}
          </nav>
        </header>
        <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
