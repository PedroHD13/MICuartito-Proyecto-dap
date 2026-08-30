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

export function useSession() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY);
    if (stored) {
      setSession(JSON.parse(stored));
    }
    setLoading(false);
  }, []);

  const login = useCallback((newSession: Session) => {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(newSession));
    setSession(newSession);
  }, []);

  const logout = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
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