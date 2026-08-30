'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '../../../../useSession';
import '../../../styles/admin-cuarto-detalle-styles.css';
import AppIcon from '../../../components/AppIcon';

interface RoomDetail {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string;
  bathroom: string;
  capacity: string;
  services: string[];
  images: string[];
  views: number;
  owner: {
    name: string;
    username: string;
    phone: string | null;
  };
}

export default function AdminCuartoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { session, loading: authLoading } = useRequireAuth('admin');

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);

  // Campos editables
  const [tipo, setTipo] = useState('privada');
  const [capacidad, setCapacidad] = useState('1');
  const [precio, setPrecio] = useState('');
  const [activo, setActivo] = useState(true);

  const loadRoom = async () => {
    try {
      const response = await fetch(`/api/cuartos/${params.id}?admin=true`);
      const data = await response.json();

      if (!response.ok) {
        setRoom(null);
        return;
      }

      setRoom(data.room);
      setPrecio(String(data.room.price));
      setCapacidad(data.room.capacity);
      setActivo(data.room.active);
      setTipo(data.room.type === 'Compartida' ? 'compartida' : 'privada');
    } catch (error) {
      console.error('Error cargando el cuarto:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (params.id) loadRoom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (authLoading || !session) {
    return null;
  }

  const handleSave = async () => {
    try {
      const response = await fetch(`/api/cuartos/${params.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo, capacidad, precio, activo }),
      });

      if (!response.ok) {
        alert('No se pudo actualizar el cuarto.');
        return;
      }

      alert('Cuarto actualizado exitosamente');
      loadRoom();
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  const handleDelete = async () => {
    if (!room) return;
    const confirmed = window.confirm(
      `¿Eliminar "${room.title}"? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cuartos/${params.id}`, { method: 'DELETE' });
      if (!response.ok) {
        alert('No se pudo eliminar el cuarto.');
        return;
      }
      router.push('/admin/cuartos');
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="admin-detalle-page">
      <button className="admin-detalle-back-btn" onClick={() => router.push('/admin/cuartos')}>
        <AppIcon name="arrowLeft" /> Volver al listado
      </button>

      {loading ? (
        <div className="admin-detalle-loading">Cargando...</div>
      ) : !room ? (
        <div className="admin-detalle-loading">No se encontró este cuarto.</div>
      ) : (
        <div className="admin-detalle-grid">
          {/* Info de solo lectura */}
          <div className="admin-detalle-info">
            <img
              src={room.images[0]}
              alt={room.title}
              className="admin-detalle-image"
            />
            <h1>{room.title}</h1>
            <p className="admin-detalle-location"><AppIcon name="building" /> {room.location}</p>

            <div className="admin-detalle-owner">
              <p className="label">Propietario</p>
              <p className="value">{room.owner.name} (@{room.owner.username})</p>
              {room.owner.phone && <p className="value">{room.owner.phone}</p>}
            </div>

            <div className="admin-detalle-owner">
              <p className="label">Vistas</p>
              <p className="value"><AppIcon name="eye" /> {room.views}</p>
            </div>

            {room.services.length > 0 && (
              <div className="admin-detalle-owner">
                <p className="label">Servicios</p>
                <p className="value">{room.services.join(', ')}</p>
              </div>
            )}
          </div>

          {/* Panel de edición */}
          <div className="admin-detalle-edit">
            <h3>Editar información</h3>

            <div className="admin-edit-field">
              <label>Tipo de habitación</label>
              <select value={tipo} onChange={(e) => setTipo(e.target.value)}>
                <option value="privada">Privada</option>
                <option value="compartida">Compartida</option>
              </select>
            </div>

            <div className="admin-edit-field">
              <label>Capacidad</label>
              <select value={capacidad} onChange={(e) => setCapacidad(e.target.value)}>
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5+">5 o más personas</option>
              </select>
            </div>

            <div className="admin-edit-field">
              <label>Precio mensual (Bs.)</label>
              <input
                type="number"
                min={0}
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
              />
            </div>

            <div className="admin-edit-field admin-edit-toggle">
              <label>Estado</label>
              <button
                type="button"
                className={`admin-toggle-btn ${activo ? 'activo' : 'pausado'}`}
                onClick={() => setActivo(!activo)}
              >
                {activo ? 'Activo' : 'Pausado'}
              </button>
            </div>

            <div className="admin-edit-actions">
              <button className="admin-btn-save" onClick={handleSave}>
                Guardar Cambios
              </button>
              <button className="admin-btn-delete-full" onClick={handleDelete}>
                Eliminar Cuarto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}