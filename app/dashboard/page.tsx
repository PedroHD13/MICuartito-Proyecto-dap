'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../useSession';

export default function DashboardPage() {
  const router = useRouter();
  const { session, loading } = useRequireAuth();

  useEffect(() => {
    if (!loading && session) {
      // Mapeo de roles a rutas
      const roleRoutes: Record<string, string> = {
        'inquilino': '/inquilino',
        'propietario': '/propietario',
        'admin': '/admin'
      };

      const route = roleRoutes[session.role];
      if (route) {
        router.replace(route);
      } else {
        // Si el rol no es válido, cerrar sesión
        localStorage.removeItem('micuartito-session');
        router.replace('/login');
      }
    }
  }, [session, loading, router]);

  // Mostrar loader mientras redirige
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      fontSize: '1.2em',
      color: '#666'
    }}>
      Cargando...
    </div>
  );
}