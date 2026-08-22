'use client';

import { useState, useEffect } from 'react';
import { useRequireAuth } from '../../useSession';
import { useRouter } from 'next/navigation';
import '../styles/admin-styles.css';
import AppIcon from '../components/AppIcon';

interface StoredUser {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'inquilino' | 'propietario' | 'admin';
}

interface Room {
  id: number;
  [key: string]: any;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('admin');

  const [totalUsuarios, setTotalUsuarios] = useState(0);
  const [totalInquilinos, setTotalInquilinos] = useState(0);
  const [totalPropietarios, setTotalPropietarios] = useState(0);
  const [totalCuartos, setTotalCuartos] = useState(0);

  useEffect(() => {
    try {
      const users: StoredUser[] = JSON.parse(localStorage.getItem('micuartito-users') || '[]');
      setTotalUsuarios(users.length);
      setTotalInquilinos(users.filter(u => u.role === 'inquilino').length);
      setTotalPropietarios(users.filter(u => u.role === 'propietario').length);

      const cuartos: Room[] = JSON.parse(localStorage.getItem('cuartos') || '[]');
      setTotalCuartos(cuartos.length);
    } catch (error) {
      console.error('Error leyendo datos para el dashboard admin:', error);
    }
  }, []);

  if (loading || !session) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="admin-container">
      {/* Header */}
      <div className="admin-header">
        <div className="admin-header-top">
          <div>
            <h1>Panel de Administración</h1>
            <p>Bienvenido, {session.username}</p>
          </div>
          <button className="admin-logout-btn" onClick={handleLogout}>
            <AppIcon name="rightFromBracket" />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <span className="admin-stat-icon"><AppIcon name="userGroup" /></span>
          <span className="admin-stat-value">{totalUsuarios}</span>
          <span className="admin-stat-label">Usuarios totales</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon"><AppIcon name="magnifyingGlass" /></span>
          <span className="admin-stat-value">{totalInquilinos}</span>
          <span className="admin-stat-label">Inquilinos</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon"><AppIcon name="house" /></span>
          <span className="admin-stat-value">{totalPropietarios}</span>
          <span className="admin-stat-label">Propietarios</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-icon"><AppIcon name="bed" /></span>
          <span className="admin-stat-value">{totalCuartos}</span>
          <span className="admin-stat-label">Cuartos publicados</span>
        </div>
      </div>

      {/* Acceso rápido a gestión de usuarios */}
      <div className="admin-section">
        <div className="admin-section-title">Gestión</div>
        <button
          className="admin-action-card"
          onClick={() => router.push('/admin/usuarios')}
        >
          <span className="admin-action-icon"><AppIcon name="gear" /></span>
          <div className="admin-action-info">
            <h3>Gestionar Usuarios</h3>
            <p>Ver, editar o eliminar cuentas registradas</p>
          </div>
        </button>
      </div>
    </div>
  );
}