"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle, WalletCards } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";
import { ApiError } from "@/lib/api-client";

const schema = z.object({
  usuario: z.string().trim().min(1, "Informe seu usuário."),
  senha: z.string().min(1, "Informe sua senha."),
});

type LoginFormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();
  const { register, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { usuario: "", senha: "" },
  });

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  async function submit(values: LoginFormValues) {
    try {
      await login({ usuario: values.usuario.trim(), senha: values.senha });
    } catch (requestError) {
      setError("root", { message: requestError instanceof ApiError ? requestError.message : "Não foi possível entrar. Tente novamente." });
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-muted/30 p-4">
      <div className="absolute inset-x-0 top-0 h-72 bg-gradient-to-b from-primary/10 to-transparent" />
      <Card className="relative w-full max-w-md shadow-xl shadow-primary/5">
        <CardHeader className="items-center text-center">
          <span className="mb-2 grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <WalletCards className="size-6" />
          </span>
          <CardTitle className="text-2xl">Bem-vindos à sua casa</CardTitle>
          <CardDescription>Entre com o acesso compartilhado para organizar as finanças do mês.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-5" onSubmit={handleSubmit(submit)} noValidate>
            <div className="space-y-2">
              <Label htmlFor="usuario">Usuário</Label>
              <Input
                id="usuario"
                type="text"
                autoComplete="username"
                placeholder="Digite seu usuário"
                {...register("usuario")}
                aria-invalid={Boolean(errors.usuario)}
                disabled={isSubmitting}
              />
              {errors.usuario && <p className="text-xs text-destructive">{errors.usuario.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senha">Senha</Label>
              <Input
                id="senha"
                type="password"
                autoComplete="current-password"
                placeholder="Sua senha"
                {...register("senha")}
                aria-invalid={Boolean(errors.senha)}
                disabled={isSubmitting}
              />
              {errors.senha && <p className="text-xs text-destructive">{errors.senha.message}</p>}
            </div>

            {errors.root?.message && (
              <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {errors.root.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={isSubmitting || isLoading}>
              {isSubmitting && <LoaderCircle className="size-4 animate-spin" />}
              {isSubmitting ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
