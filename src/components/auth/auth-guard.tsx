"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { WalletCards } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.replace("/login");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-muted/30">
        <div className="flex items-center gap-3 text-sm text-muted-foreground">
          <WalletCards className="size-5 animate-pulse text-primary" />
          Carregando sua casa...
        </div>
      </div>
    );
  }

  return children;
}
