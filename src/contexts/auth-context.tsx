"use client";

import { useRouter } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { apiClient, tokenStorage } from "@/lib/api-client";

type LoginCredentials = { usuario: string; senha: string };
type LoginResponse = { token: string };

type AuthContextValue = {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const hydrationCheck = window.setTimeout(() => {
      setIsAuthenticated(Boolean(tokenStorage.get()));
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(hydrationCheck);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const response = await apiClient.post<LoginResponse>("/auth/login", credentials, {
      authenticated: false,
      silentError: true,
    });
    tokenStorage.set(response.token);
    setIsAuthenticated(true);
    router.replace("/dashboard");
  }, [router]);

  const logout = useCallback(() => {
    tokenStorage.clear();
    setIsAuthenticated(false);
    router.replace("/login");
  }, [router]);

  const value = useMemo(() => ({ isAuthenticated, isLoading, login, logout }), [
    isAuthenticated,
    isLoading,
    login,
    logout,
  ]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth deve ser usado dentro de AuthProvider.");
  return context;
}
