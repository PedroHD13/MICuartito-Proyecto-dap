'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import DashboardShell from '../../components/DashboardShell';
import '../../styles/mis-cuartos-styles.css';
import AppIcon from '../../components/AppIcon';

interface MyRoom {
  id: number;
  title: string;
  image: string;
  images: string[];
  type: 'Privada' | 'Compartida';
  tipoRaw: string;
  capacity: number;
  capacidadRaw: string;
  price: number;
  reglas: string;
  services: string[];
  active: boolean;
  views: number;
  createdAt: string;
}

type FilterType = 'all' | 'active' | 'inactive';

export default function MisCuartos() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('propietario');

  const [myRooms, setMyRooms] = useState<MyRoom[]>([]);
  const [filter, setFilter] = useState<FilterType>('all');

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTipo, setEditTipo] = useState('privada');
  const [editCapacidad, setEditCapacidad] = useState('1');
  const [editPrecio, setEditPrecio] = useState('');
  const [editReglas, setEditReglas] = useState('');

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const loadMyRooms = useCallback(async () => {
    if (!session) return;
    try {
      const response = await fetch(`/api/cuartos?owner=${session.username}`);
      const data = await response.json();
      setMyRooms(data.rooms || []);
    } catch (error) {
      console.error('Error cargando mis cuartos:', error);
      setMyRooms([]);
    }
  }, [session]);

  useEffect(() => {
    loadMyRooms();
  }, [loadMyRooms]);

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
  const openEditModal = (room: MyRoom) => {
    setEditingId(room.id);
    setEditTipo(room.tipoRaw || 'privada');
    setEditCapacidad(room.capacidadRaw || '1');
    setEditPrecio(String(room.price ?? ''));
    setEditReglas(room.reglas || '');
    setEditModalOpen(true);
  };

  const closeEditModal = () => {
    setEditModalOpen(false);
    setEditingId(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;

    try {
      const response = await fetch(`/api/cuartos/${editingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: editTipo,
          capacidad: editCapacidad,
          precio: editPrecio,
          reglas: editReglas,
        }),
      });

      if (!response.ok) {
        const result = await response.json();
        alert(result.error || 'No se pudo actualizar el cuarto.');
        return;
      }

      await loadMyRooms();
      closeEditModal();
      alert('Cuarto actualizado exitosamente');
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  // --- Activar / Pausar ---
  const toggleRoomStatus = async (room: MyRoom) => {
    try {
      const response = await fetch(`/api/cuartos/${room.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !room.active }),
      });

      if (!response.ok) {
        alert('No se pudo actualizar el estado del cuarto.');
        return;
      }

      await loadMyRooms();
      alert(`Cuarto ${!room.active ? 'activado' : 'pausado'} exitosamente`);
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  // --- Eliminar ---
  const openDeleteModal = (id: number) => {
    setDeletingId(id);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setDeleteModalOpen(false);
    setDeletingId(null);
  };

  const confirmDelete = async () => {
    if (deletingId === null) return;

    try {
      const response = await fetch(`/api/cuartos/${deletingId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        alert('No se pudo eliminar el cuarto.');
        return;
      }

      await loadMyRooms();
      closeDeleteModal();
      alert('Cuarto eliminado exitosamente');
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
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
            <div className="stat-icon"><AppIcon name="house" /></div>
            <div className="stat-number">{totalRooms}</div>
            <div className="stat-label">Total Publicados</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><AppIcon name="check" /></div>
            <div className="stat-number">{activeRooms}</div>
            <div className="stat-label">Activos</div>
          </div>
          <div className="stat-card">
            <div className="stat-icon"><AppIcon name="eye" /></div>
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
            <AppIcon name="plus" /> Publicar Nuevo Cuarto
          </button>
        </div>

        {/* Lista de cuartos */}
        {myRooms.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><AppIcon name="house" /></div>
            <h3>No tienes cuartos publicados</h3>
            <p>Comienza publicando tu primer cuarto para atraer inquilinos</p>
            <button className="btn-primary" onClick={goToPublish}>
              Publicar Cuarto
            </button>
          </div>
        ) : filteredRooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}><AppIcon name="envelope" /></div>
            <h3 style={{ marginBottom: '10px' }}>No hay cuartos en esta categoría</h3>
            <p>Cambia el filtro para ver más publicaciones</p>
          </div>
        ) : (
          <div className="my-rooms-container">
            {filteredRooms.map((room) => (
              <div className={`my-room-card ${!room.active ? 'inactive' : ''}`} key={room.id}>
                <div className="room-card-header">
                  <img
                    src={room.image}
                    alt="Cuarto"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://via.placeholder.com/400x300/1A3B5D/ffffff?text=Cuarto';
                    }}
                  />
                  <span className={`room-status-badge ${room.active ? 'active' : 'inactive'}`}>
                    {room.active ? <><AppIcon name="check" /> Activo</> : <><AppIcon name="pause" /> Pausado</>}
                  </span>
                  <span className="room-views"><AppIcon name="eye" /> {room.views || 0} vistas</span>
                </div>
                <div className="room-card-body">
                  <div className="room-card-title">{room.title}</div>
                  <div className="room-card-info">
                    <div className="info-item"><span><AppIcon name="doorOpen" /></span> {room.tipoRaw}</div>
                    <div className="info-item">
                      <span><AppIcon name="userGroup" /></span> {room.capacidadRaw}{' '}
                      {room.capacity > 1 ? 'personas' : 'persona'}
                    </div>
                    {room.services && room.services.length > 0 && (
                      <div className="info-item"><span><AppIcon name="listCheck" /></span> {room.services.length} servicios</div>
                    )}
                  </div>
                  <div className="room-card-price">
                    Bs. {room.price} <span>/mes</span>
                  </div>
                  <div className="room-card-actions">
                    <button className="action-btn btn-edit" onClick={() => openEditModal(room)}>
                      <AppIcon name="pencil" /> Editar
                    </button>
                    <button
                      className={`action-btn btn-toggle ${room.active ? 'active' : ''}`}
                      onClick={() => toggleRoomStatus(room)}
                    >
                      {room.active ? <><AppIcon name="pause" /> Pausar</> : <><AppIcon name="circlePlay" /> Activar</>}
                    </button>
                    <button className="action-btn btn-delete" onClick={() => openDeleteModal(room.id)}>
                      <AppIcon name="trash" /> Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
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
              <h2><AppIcon name="pencil" /> Editar Cuarto</h2>
              <button className="close-modal" onClick={closeEditModal} aria-label="Cerrar"><AppIcon name="xmark" /></button>
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