"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export type Role = "inquilino" | "propietario" | "admin";

export interface Session {
  username: string;
  name: string;
  role: Role;
}

interface StoredSession extends Session {
  expiresAt: number;
}

const SESSION_KEY = "micuartito-session";
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 horas

function isExpired(stored: StoredSession): boolean {
  return Date.now() > stored.expiresAt;
}

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      const parsed: StoredSession = JSON.parse(stored);

      if (isExpired(parsed)) {
        // Sesión vencida: la borramos y no la cargamos
        sessionStorage.removeItem(SESSION_KEY);
        setSession(null);
      } else {
        setSession(parsed);
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback((newSession: Session) => {
    const sessionWithExpiry: StoredSession = {
      ...newSession,
      expiresAt: Date.now() + SESSION_DURATION_MS,
    };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionWithExpiry));
    setSession(sessionWithExpiry);
  }, []);

   const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  }, []);

  return { session, loading, login, logout };
}

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