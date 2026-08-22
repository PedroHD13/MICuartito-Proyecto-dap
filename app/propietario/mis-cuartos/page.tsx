'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import DashboardShell from '../../components/DashboardShell';
import '../../styles/mis-cuartos-styles.css';

interface MyRoom {
  titulo?: string;
  fotos?: string[];
  tipo: string;
  capacidad: string;
  precio: string;
  reglas?: string;
  servicios?: string[];
  active: boolean;
  views: number;
  createdAt: string;
  [key: string]: any;
}

type FilterType = 'all' | 'active' | 'inactive';

export default function MisCuartos() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('propietario');

  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editTipo, setEditTipo] = useState('privada');
  const [editCapacidad, setEditCapacidad] = useState('1');
  const [editPrecio, setEditPrecio] = useState('');
  const [editReglas, setEditReglas] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingIndex, setDeletingIndex] = useState<number | null>(null);

  const loadMyRooms = useCallback(() => {
    const storedRooms = JSON.parse(localStorage.getItem('cuartos') || '[]');
    const normalized: MyRoom[] = storedRooms.map((room: any) => ({
      ...room,
      active: room.active !== undefined ? room.active : true,
      views: room.views || 0,
      createdAt: room.createdAt || new Date().toISOString(),
    }));
    setMyRooms(normalized);
  }, []);

  useEffect(() => {
    loadMyRooms();
  }, [loadMyRooms]);

  const saveRooms = (rooms: MyRoom[]) => {
    setMyRooms(rooms);
    localStorage.setItem('cuartos', JSON.stringify(rooms));
  };

  if (loading || !session) {
    return null;
  }

  const totalRooms = myRooms.length;
  const activeRooms = myRooms.filter((r) => r.active).length;
  const inactiveRooms = myRooms.filter((r) => !r.active).length;
  const totalViews = myRooms.reduce((sum, r) => sum + (r.views || 0), 0);

  const filteredRooms =
    filter === 'active'
      ? myRooms.filter((r) => r.active)
      : filter === 'inactive'
      ? myRooms.filter((r) => !r.active)
      : myRooms;

  const goToPublish = () => router.push('/propietario/publicar');

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  // --- Editar ---
  const openEditModal = (index: number) => {
    const room = myRooms[index];
    setEditingIndex(index);
    setEditTipo(room.tipo || 'privada');
    setEditCapacidad(room.capacidad || '1');
    setEditPrecio(room.precio || '');
    setEditReglas(room.reglas || '');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingIndex(null);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingIndex === null) return;

    const updated = [...myRooms];
    updated[editingIndex] = {
      ...updated[editingIndex],
      tipo: editTipo,
      capacidad: editCapacidad,
      precio: editPrecio,
      reglas: editReglas,
    };
    saveRooms(updated);
    closeEditModal();
    alert('✅ Cuarto actualizado exitosamente');
  };

  // --- Activar / Pausar ---
  const toggleRoomStatus = (index: number) => {
    const updated = [...myRooms];
    updated[index] = { ...updated[index], active: !updated[index].active };
    saveRooms(updated);
    alert(`✅ Cuarto ${updated[index].active ? 'activado' : 'pausado'} exitosamente`);
  };

  // --- Eliminar ---
  const openDeleteModal = (index: number) => {
    setDeletingIndex(index);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingIndex(null);
  };

  const confirmDelete = () => {
    if (deletingIndex === null) return;
    const updated = myRooms.filter((_, i) => i !== deletingIndex);
    saveRooms(updated);
    closeDeleteModal();
    alert('✅ Cuarto eliminado exitosamente');
  };

  return (
    <DashboardShell role="propietario" userName={session.name} onLogout={handleLogout}>
      <div className="page-content">
        {/* Encabezado */}
        <div className="page-header">
          <h1>Mis Cuartos</h1>
          <p>Gestiona tus publicaciones</p>
        </div>

        {/* Stats */}
        <div className="stats-section">
          <div className="stat-card">
            <div className="stat-icon">🏠</div>
            <div className="stat-number">{totalRooms}</div>
            <div className="stat-label">Total Publicados</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-number">{activeRooms}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👁️</div>
            <div className="stat-number">{totalViews}</div>
            <div className="stat-label">Visualizaciones</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            Todos (<span>{totalRooms}</span>)
          </button>
          <button
            className={`filter-tab ${filter === 'active' ? 'active' : ''}`}
            onClick={() => setFilter('active')}
          >
            Activos (<span>{activeRooms}</span>)
          </button>
          <button
            className={`filter-tab ${filter === 'inactive' ? 'active' : ''}`}
            onClick={() => setFilter('inactive')}
          >
            Pausados (<span>{inactiveRooms}</span>)
          </button>
        </div>

        {/* Botón Publicar Nuevo */}
        <div className="action-buttons">
          <button className="btn-new-room" onClick={goToPublish}>
            ➕ Publicar Nuevo Cuarto
          </button>
        </div>

        {/* Lista de cuartos */}
        {myRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🏠</div>
            <h3>No tienes cuartos publicados</h3>
            <p>Comienza publicando tu primer cuarto para atraer inquilinos</p>
            <button className="btn-primary" onClick={goToPublish}>
              Publicar Cuarto
            </button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>📭</div>
            <h3 style={{ marginBottom: '10px' }}>No hay cuartos en esta categoría</h3>
            <p>Cambia el filtro para ver más publicaciones</p>
          </div>
        ) : (
          <div className="my-rooms-container">
            {filteredRooms.map((room) => {
              const realIndex = myRooms.indexOf(room);
              const firstImage =
                room.fotos && room.fotos.length > 0
                  ? room.fotos[0]
                  : 'https://via.placeholder.com/400x300/1A3B5D/ffffff?text=Cuarto';

              return (
                <div className={`my-room-card ${!room.active ? 'inactive' : ''}`} key={realIndex}>
                  <div className="room-card-header">
                    <img
                      src={firstImage}
                      alt="Cuarto"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          'https://via.placeholder.com/400x300/1A3B5D/ffffff?text=Cuarto';
                      }}
                    />
                    <span className={`room-status-badge ${room.active ? 'active' : 'inactive'}`}>
                      {room.active ? '✓ Activo' : '⏸ Pausado'}
                    </span>
                    <span className="room-views">👁️ {room.views || 0} vistas</span>
                  </div>
                  <div className="room-card-body">
                    <div className="room-card-title">
                      {room.titulo || `Cuarto ${room.tipo} - ${room.capacidad} persona(s)`}
                    </div>
                    <div className="room-card-info">
                      <div className="info-item"><span>🚪</span> {room.tipo}</div>
                      <div className="info-item">
                        <span>👥</span> {room.capacidad}{' '}
                        {parseInt(room.capacidad) > 1 ? 'personas' : 'persona'}
                      </div>
                      {room.servicios && room.servicios.length > 0 && (
                        <div className="info-item"><span>✨</span> {room.servicios.length} servicios</div>
                      )}
                    </div>
                    <div className="room-card-price">
                      Bs. {room.precio} <span>/mes</span>
                    </div>
                    <div className="room-card-actions">
                      <button className="action-btn btn-edit" onClick={() => openEditModal(realIndex)}>
                        ✏️ Editar
                      </button>
                      <button
                        className={`action-btn btn-toggle ${room.active ? 'active' : ''}`}
                        onClick={() => toggleRoomStatus(realIndex)}
                      >
                        {room.active ? '⏸️ Pausar' : '▶️ Activar'}
                      </button>
                      <button className="action-btn btn-delete" onClick={() => openDeleteModal(realIndex)}>
                        🗑️ Eliminar
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Modal Editar */}
        <div
          className={`modal ${editModalOpen ? 'active' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeEditModal();
          }}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h2>✏️ Editar Cuarto</h2>
              <button className="close-modal" onClick={closeEditModal}>×</button>
            </div>
            <div className="modal-body">
              <form onSubmit={handleEditSubmit}>
                <div className="input-group">
                  <label>Tipo de Habitación</label>
                  <select value={editTipo} onChange={(e) => setEditTipo(e.target.value)}>
                    <option value="privada">Privada</option>
                    <option value="compartida">Compartida</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Capacidad</label>
                  <select value={editCapacidad} onChange={(e) => setEditCapacidad(e.target.value)}>
                    <option value="1">1 persona</option>
                    <option value="2">2 personas</option>
                    <option value="3">3 personas</option>
                    <option value="4">4 personas</option>
                    <option value="5+">5 o más personas</option>
                  </select>
                </div>
                <div className="input-group">
                  <label>Precio mensual (Bs.)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editPrecio}
                    onChange={(e) => setEditPrecio(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label>Reglas de la Casa</label>
                  <textarea
                    rows={4}
                    value={editReglas}
                    onChange={(e) => setEditReglas(e.target.value)}
                  />
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn-cancel" onClick={closeEditModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn-save">
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Modal Eliminar */}
        <div
          className={`modal ${deleteModalOpen ? 'active' : ''}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) closeDeleteModal();
          }}
        >
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>⚠️ Confirmar Eliminación</h2>
            </div>
            <div className="modal-body">
              <p>¿Estás seguro que deseas eliminar esta publicación?</p>
              <p className="warning-text">Esta acción no se puede deshacer.</p>
              <div className="modal-actions">
                <button className="btn-cancel" onClick={closeDeleteModal}>
                  Cancelar
                </button>
                <button className="btn-delete" onClick={confirmDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
