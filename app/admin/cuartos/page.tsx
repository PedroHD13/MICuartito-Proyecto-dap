'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import '../../styles/admin-cuartos-styles.css';
import AppIcon from '../../components/AppIcon';

interface CuartoRow {
  id: number;
  titulo: string;
  tipo: string;
  precio: string;
  capacidad: string;
  zona: string;
  barrio: string | null;
  activo: boolean;
  vistas: number;
  owner_name: string;
  owner_username: string;
}

const PAGE_SIZE = 10;

export default function AdminCuartosPage() {
  const router = useRouter();
  const { session, loading } = useRequireAuth('admin');

  const [cuartos, setCuartos] = useState<CuartoRow[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const loadCuartos = useCallback(async (targetPage: number) => {
    try {
      const response = await fetch(`/api/admin/cuartos?page=${targetPage}&limit=${PAGE_SIZE}`);
      const data = await response.json();
      setCuartos(data.cuartos || []);
      setTotalPages(data.totalPages || 1);
      setTotal(data.total || 0);
    } catch (error) {
      console.error('Error cargando cuartos:', error);
    }
  }, []);

  useEffect(() => {
    loadCuartos(page);
  }, [page, loadCuartos]);

  if (loading || !session) {
    return null;
  }

  const handleDelete = async (cuarto: CuartoRow) => {
    const confirmed = window.confirm(
      `¿Eliminar "${cuarto.titulo}" de ${cuarto.owner_name}? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    try {
      const response = await fetch(`/api/cuartos/${cuarto.id}`, { method: 'DELETE' });
      if (!response.ok) {
        alert('No se pudo eliminar el cuarto.');
        return;
      }
      // Si borramos el único cuarto de la última página, retrocedemos una página
      if (cuartos.length === 1 && page > 1) {
        setPage(page - 1);
      } else {
        loadCuartos(page);
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="admin-cuartos-container">
      <div className="admin-cuartos-header">
        <button className="admin-cuartos-back-btn" onClick={() => router.push('/admin')}>
          <AppIcon name="arrowLeft" />
        </button>
        <div>
          <h1>Gestión de Cuartos</h1>
          <p>{total} cuarto(s) publicados en total</p>
        </div>
      </div>

      <div className="admin-cuartos-table-wrapper">
        {cuartos.length === 0 ? (
          <div className="admin-cuartos-empty">No hay cuartos publicados.</div>
        ) : (
          <table className="admin-cuartos-table">
            <thead>
              <tr>
                <th>Título</th>
                <th>Propietario</th>
                <th>Tipo</th>
                <th>Precio</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {cuartos.map((c) => (
                <tr key={c.id}>
                  <td>{c.titulo}</td>
                  <td>{c.owner_name}</td>
                  <td>{c.tipo === 'compartida' ? 'Compartida' : 'Privada'}</td>
                  <td>Bs. {c.precio}</td>
                  <td>
                    <span className={`admin-cuarto-status ${c.activo ? 'activo' : 'pausado'}`}>
                      {c.activo ? 'Activo' : 'Pausado'}
                    </span>
                  </td>
                  <td>
                    <div className="admin-cuartos-actions">
                      <button
                        className="admin-btn-view"
                        onClick={() => router.push(`/admin/cuartos/${c.id}`)}
                      >
                        Ver / Editar
                      </button>
                      <button className="admin-btn-delete" onClick={() => handleDelete(c)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="admin-pagination">
          <button
            className="admin-page-arrow"
            onClick={() => goToPage(page - 1)}
            disabled={page === 1}
          >
            ‹ Anterior
          </button>

          <div className="admin-page-numbers">
            {pageNumbers.map((p) => (
              <button
                key={p}
                className={`admin-page-number ${p === page ? 'active' : ''}`}
                onClick={() => goToPage(p)}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            className="admin-page-arrow"
            onClick={() => goToPage(page + 1)}
            disabled={page === totalPages}
          >
            Siguiente ›
          </button>
        </div>
      )}
    </div>
  );
}