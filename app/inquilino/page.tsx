'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../useSession';
import { useRooms } from '../hooks/useRooms';
import { useFavorites } from '../hooks/useFavorites';
import DashboardShell from '../components/DashboardShell';
import '../styles/dashboard-styles.css';
import AppIcon from '../components/AppIcon';

export default function InquilinoDashboard() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('inquilino');
  const { rooms, refreshRooms } = useRooms();
  const { favoriteIds } = useFavorites();

  const [greeting, setGreeting] = useState('');
  const [recentRooms, setRecentRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    favorites: 0,
    availableRooms: 0,
    savedSearches: 0
  });

  // Configurar saludo según la hora
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('🌅 Buenos días');
    else if (hour < 18) setGreeting('☀️ Buenas tardes');
    else setGreeting('🌙 Buenas noches');
  }, []);

  // Cargar datos
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  // Actualizar estadísticas
  useEffect(() => {
    if (rooms.length > 0) {
      const sorted = [...rooms].sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      });
      setRecentRooms(sorted.slice(0, 3));

      setStats({
        favorites: favoriteIds.length,
        availableRooms: rooms.filter(r => r.active !== false).length,
        savedSearches: 0
      });
    }
  }, [rooms, favoriteIds]);

  if (loading || !session) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login'); // ✅ Redirige al login
    }
  };

  const navigateTo = (path: string) => {
    router.push(`/inquilino/${path}`);
  };

  return (
    <DashboardShell role="inquilino" userName={session.name} onLogout={handleLogout}>
      <div className="dashboard-content">
        {/* Encabezado de bienvenida */}
        <div className="dashboard-page-header">
          <span className="greeting">{greeting}</span>
          <h1>{session.name}</h1>
          <span className="user-role"><AppIcon name="magnifyingGlass" /> Inquilino</span>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon"><AppIcon name="heart" /></span>
            <span className="stat-value">{stats.favorites}</span>
            <span className="stat-label">Favoritos</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon"><AppIcon name="house" /></span>
            <span className="stat-value">{stats.availableRooms}</span>
            <span className="stat-label">Cuartos Disponibles</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon"><AppIcon name="magnifyingGlass" /></span>
            <span className="stat-value">{stats.savedSearches}</span>
            <span className="stat-label">Búsquedas Guardadas</span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button className="action-card primary" onClick={() => navigateTo('buscar')}>
            <span className="action-icon"><AppIcon name="magnifyingGlass" /></span>
            <div className="action-info">
              <h3>Buscar Cuartos</h3>
              <p>Encuentra tu espacio ideal</p>
            </div>
          </button>

          <button className="action-card" onClick={() => navigateTo('favoritos')}>
            <span className="action-icon"><AppIcon name="heart" /></span>
            <div className="action-info">
              <h3>Mis Favoritos</h3>
              <p>{stats.favorites} cuartos guardados</p>
            </div>
          </button>

          <button className="action-card" onClick={() => navigateTo('perfil')}>
            <span className="action-icon"><AppIcon name="user" /></span>
            <div className="action-info">
              <h3>Mi Perfil</h3>
              <p>Edita tu información</p>
            </div>
          </button>
        </div>

        {/* Recent Rooms */}
        <div className="recent-section">
          <div className="section-header">
            <h3>🆕 Cuartos Recientes</h3>
            <button className="view-all" onClick={() => navigateTo('buscar')}>
              Ver todos →
            </button>
          </div>

          {recentRooms.length === 0 ? (
            <div className="empty-recent">
              <p>No hay cuartos disponibles aún</p>
            </div>
          ) : (
            <div className="recent-rooms">
              {recentRooms.map(room => (
                <div
                  key={room.id}
                  className="recent-room-card"
                  onClick={() => navigateTo('buscar')}
                >
                  <img
                    src={room.image}
                    alt={room.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/1A3B5D/ffffff?text=Cuarto';
                    }}
                  />
                  <div className="recent-room-info">
                    <h4>{room.title}</h4>
                    <p className="location"><AppIcon name="building" /> {room.location}</p>
                    <p className="price">Bs. {room.price}/mes</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
