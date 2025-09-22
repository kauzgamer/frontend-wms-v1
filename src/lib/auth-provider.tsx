import { useState, useEffect, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  AuthContext,
  type User,
  type AuthContextType,
} from "./auth-context-base";

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
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      // Try to surface backend error message (e.g., "Invalid credentials" or lock info)
      try {
        const errData = await response.json();
        const message =
          typeof errData?.message === "string"
            ? errData.message
            : Array.isArray(errData?.message)
            ? errData.message.join("\n")
            : "Falha no login";
        throw new Error(message);
      } catch {
        throw new Error("Falha no login");
      }
    }
    const data = await response.json();
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
