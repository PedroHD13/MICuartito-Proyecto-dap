'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../useSession';
import { useRooms } from '../hooks/useRooms';
import DashboardShell from '../components/DashboardShell';
import '../styles/dashboard-styles.css';

export default function PropietarioDashboard() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('propietario');
  const { allRooms, refreshRooms } = useRooms();

  const [greeting, setGreeting] = useState('');
  const [myRooms, setMyRooms] = useState<any[]>([]);
  const [stats, setStats] = useState({
    myRoomsCount: 0,
    totalViews: 0,
    pendingRequests: 0
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

  // Filtrar solo los cuartos publicados por el propietario (id >= 100, ver useRooms.ts)
  // y calcular estadísticas
  useEffect(() => {
    const published = allRooms.filter(room => room.id >= 100);
    const sorted = [...published].sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return dateB - dateA;
    });

    setMyRooms(sorted.slice(0, 3));

    setStats({
      myRoomsCount: published.length,
      totalViews: published.reduce((sum, room) => sum + (room.views || 0), 0),
      pendingRequests: 0 // TODO: conectar cuando exista el sistema de solicitudes
    });
  }, [allRooms]);

  if (loading || !session) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  const navigateTo = (path: string) => {
    router.push(`/propietario/${path}`);
  };

  return (
    <DashboardShell role="propietario" userName={session.name} onLogout={handleLogout}>
      <div className="dashboard-content">
        {/* Encabezado de bienvenida */}
        <div className="dashboard-page-header">
          <span className="greeting">{greeting}</span>
          <h1>{session.name}</h1>
          <span className="user-role">🏠 Propietario</span>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-icon">🏘️</span>
            <span className="stat-value">{stats.myRoomsCount}</span>
            <span className="stat-label">Mis Cuartos</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">👁️</span>
            <span className="stat-value">{stats.totalViews}</span>
            <span className="stat-label">Vistas Totales</span>
          </div>
          <div className="stat-card">
            <span className="stat-icon">📩</span>
            <span className="stat-value">{stats.pendingRequests}</span>
            <span className="stat-label">Solicitudes</span>
          </div>
        </div>

        {/* Recent Rooms */}
        <div className="recent-section">
          <div className="section-header">
            <h3>🆕 Mis Publicaciones Recientes</h3>
            <button className="view-all" onClick={() => navigateTo('mis-cuartos')}>
              Ver todos →
            </button>
          </div>

          {myRooms.length === 0 ? (
            <div className="empty-recent">
              <p>Aún no has publicado ningún cuarto</p>
            </div>
          ) : (
            <div className="recent-rooms">
              {myRooms.map(room => (
                <div
                  key={room.id}
                  className="recent-room-card"
                  onClick={() => navigateTo('mis-cuartos')}
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
                    <p className="location">📍 {room.location}</p>
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
