"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type Role = "inquilino" | "propietario" | "admin";

export interface Session {
  username: string;
  name: string;
  role: Role;
}

const SESSION_KEY = "micuartito-session";

/**
 * Hook base: lee/escribe la sesión activa en localStorage.
 * Úsalo en cualquier componente que necesite saber quién está logueado.
 */
export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Al montar, cargamos la sesión guardada (si existe)
  useEffect(() => {
    const stored = localStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  // Guarda una nueva sesión (se usa justo después de un login exitoso)
  const login = useCallback((newSession: Session) => {
    localStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  // Cierra la sesión activa
  const logout = useCallback(() => {
    localStorage.removeItem(SESSION_KEY);
    setSession(null);
  }, []);

  return { session, loading, login, logout };
}

/**
 * Hook para páginas protegidas (perfil-inquilino, perfil-propietario, etc.).
 * Si no hay sesión, redirige a /login.
 * Si se pasa requiredRole y el rol no coincide, también redirige a /login.
 *
 * Uso típico dentro de una página protegida:
 *   const { session, loading } = useRequireAuth("inquilino");
 *   if (loading || !session) return null; // evita parpadeo mientras redirige
 */
export function useRequireAuth(requiredRole?: Role) {
  const { session, loading, logout } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;

    if (!session) {
      router.replace("/login");
      return;
    }

    if (requiredRole && session.role !== requiredRole) {
      router.replace("/login");
    }
  }, [session, loading, requiredRole, router]);

  return { session, loading, logout };
}
