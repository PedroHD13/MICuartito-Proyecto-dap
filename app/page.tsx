'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '../useSession';
import { useEffect } from 'react';

export default function HomePage() {
  const router = useRouter();
  const { session, loading } = useSession();

  // Si hay sesión, redirigir al dashboard
  useEffect(() => {
    if (!loading && session) {
      router.replace('/dashboard');
    }
  }, [session, loading, router]);

  if (loading) {
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

  // Si no hay sesión, mostrar bienvenida
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2563a8 0%, #d9764a 100%)',
      padding: '20px',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '20px',
        padding: '40px 30px',
        maxWidth: '400px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)'
      }}>
        <div style={{ fontSize: '4em', marginBottom: '10px' }}>🏠</div>
        <h1 style={{
          fontSize: '2em',
          background: 'linear-gradient(135deg, #2563a8 0%, #d9764a 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          marginBottom: '10px'
        }}>
          MiCuartito
        </h1>
        <p style={{ color: '#666', marginBottom: '30px', fontSize: '1.1em' }}>
          Encuentra o publica tu cuarto ideal
        </p>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            padding: '15px',
            background: 'linear-gradient(135deg, #2563a8 0%, #d9764a 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '1.1em',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s',
            marginBottom: '10px'
          }}
        >
          Iniciar Sesión
        </button>

        <button
          onClick={() => router.push('/login')}
          style={{
            width: '100%',
            padding: '15px',
            background: 'white',
            color: '#2563a8',
            border: '2px solid #2563a8',
            borderRadius: '12px',
            fontSize: '1.1em',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'transform 0.2s'
          }}
        >
          Registrarse
        </button>

        <div style={{ marginTop: '20px', fontSize: '0.85em', color: '#999' }}>
          <p>🔐 Usuarios de prueba:</p>
          <p style={{ margin: '4px 0' }}><strong>Inquilino:</strong> inquilino / inquilino123</p>
          <p style={{ margin: '4px 0' }}><strong>Propietario:</strong> propietario / propietario123</p>
        </div>
      </div>
    </div>
  );
}