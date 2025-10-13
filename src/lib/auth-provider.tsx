import { useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "./auth-context-base";
import { apiFetch } from "./api/client";

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const queryClient = useQueryClient();

  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await apiFetch<{
        access_token: string;
        user: {
          email: string;
          name: string;
          provider: string;
          providerId: string;
          picture?: string;
        };
      }>("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });

      const loginResponseSchema = z.object({
        access_token: z.string().min(10),
        user: z.object({
          email: z.string().email(),
          name: z.string().min(1),
          provider: z.string(),
          providerId: z.string(),
          picture: z.string().url().optional().or(z.literal("").optional()),
        }),
      });

      const parsed = loginResponseSchema.safeParse(data);
      if (!parsed.success) throw new Error("Invalid response format");

      const { access_token, user: userData } = parsed.data;
      setToken(access_token);
      setUser(userData);
      localStorage.setItem("auth_token", access_token);
      localStorage.setItem("auth_user", JSON.stringify(userData));
    } catch (error) {
      // Tratamento melhorado de erros usando o cliente API
      if (error instanceof Error) {
        // O cliente API já trata erros HTTP e retorna mensagens adequadas
        throw error;
      }

      // Fallback para erro genérico
      throw new Error("Falha no login. Verifique suas credenciais e tente novamente.");
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    queryClient.clear();
  };

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token,
    isLoading,
  };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
