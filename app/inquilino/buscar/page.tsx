'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import { useRooms } from '../../hooks/useRooms';
import { useFavorites } from '../../hooks/useFavorites';
import RoomCard from '../../components/RoomCard';
import FilterModal from '../../components/filtermodal'; // ✅ Importar el modal
import DashboardShell from '../../components/DashboardShell';
import { Room, RoomFilters } from '../../types';
import '../../styles/buscar-styles.css';
import '../../styles/filter-modal.css'; // ✅ Importar estilos del modal

export default function BuscarPage() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('inquilino');
  
  const { rooms, allRooms, filters, applyFilters, clearFilters, refreshRooms } = useRooms();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc'>('price-asc');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Aplicar búsqueda al cambiar el término
  useEffect(() => {
    applyFilters({ ...filters, searchTerm });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm]);

  // Contar filtros activos
  useEffect(() => {
    let count = 0;
    if (filters.priceMin && filters.priceMin > 0) count++;
    if (filters.priceMax && filters.priceMax > 0) count++;
    if (filters.zone) count++;
    if (filters.bathroomPrivate) count++;
    if (filters.bathroomShared) count++;
    if (filters.furnished) count++;
    if (filters.capacity) count++;
    if (filters.services && filters.services.length > 0) count++;
    setActiveFiltersCount(count);
  }, [filters]);

  // Recargar cuartos cuando la página se monta
  useEffect(() => {
    refreshRooms();
  }, [refreshRooms]);

  if (loading || !session) {
    return null;
  }

  const handleSort = () => {
    const newSort = sortBy === 'price-asc' ? 'price-desc' : 'price-asc';
    setSortBy(newSort);
    applyFilters({ ...filters, sortBy: newSort });
  };

  const handleViewDetail = (room: Room) => {
    alert(`📋 Detalles del Cuarto:\n\n` +
      `${room.title}\n` +
      `${room.location}\n\n` +
      `Precio: Bs. ${room.price}/mes\n` +
      `Tipo: ${room.type}\n` +
      `Capacidad: ${room.capacity} persona(s)\n` +
      `Baño: ${room.bathroom === 'privado' ? 'Privado' : 'Compartido'}\n` +
      `${room.furnished ? '✓ Amoblado\n' : ''}\n` +
      `Servicios: ${room.services.join(', ')}\n\n` +
      `(Próximamente: pantalla de detalles completa)`
    );
  };

  const handleContact = (room: Room) => {
    router.push('/contacto-whatsapp');
  };

  const handleApplyFilters = (newFilters: RoomFilters) => {
    applyFilters({ ...newFilters, sortBy });
  };

  const handleClearFilters = () => {
    clearFilters();
    setSearchTerm('');
    setSortBy('price-asc');
    setIsFilterModalOpen(false); // ✅ Cerrar modal al limpiar
  };

  const handleOpenModal = () => {
    setIsFilterModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsFilterModalOpen(false);
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  return (
    <DashboardShell role="inquilino" userName={session.name} onLogout={handleLogout}>
      <div className="page-content search-page">
        <div className="page-header">
          <h1>Buscar Cuartos</h1>
          <p>Encuentra tu espacio ideal</p>
        </div>

        <div className="search-toolbar">
          <div className="search-bar">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Buscar por zona, barrio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="filter-section">
            <button className="filter-btn primary" onClick={handleOpenModal}>
              🎛️ Filtros
              {activeFiltersCount > 0 && (
                <span className="filter-badge">{activeFiltersCount}</span>
              )}
            </button>
            {activeFiltersCount > 0 && (
              <button className="filter-btn clear-filter-btn" onClick={handleClearFilters}>
                ✕ Limpiar
              </button>
            )}
          </div>
        </div>

        <div className="results-header">
          <div className="results-count">
            <strong>{rooms.length}</strong> cuartos disponibles
          </div>
          <button className="sort-btn" onClick={handleSort}>
            <span>{sortBy === 'price-asc' ? '⬆️' : '⬇️'}</span>
            <span>{sortBy === 'price-asc' ? 'Menor precio' : 'Mayor precio'}</span>
          </button>
        </div>

        <div className="rooms-grid">
          {rooms.length === 0 ? (
            <div className="empty-state" style={{ gridColumn: '1 / -1' }}>
              <div className="empty-icon">😔</div>
              <h3 style={{ marginBottom: '10px' }}>No se encontraron cuartos</h3>
              <p style={{ color: '#666' }}>Intenta ajustar los filtros de búsqueda</p>
            </div>
          ) : (
            rooms.map(room => (
              <RoomCard
                key={room.id}
                room={room}
                isFavorite={isFavorite(room.id)}
                onToggleFavorite={toggleFavorite}
                onViewDetail={handleViewDetail}
                onContact={handleContact}
              />
            ))
          )}
        </div>

        <FilterModal
          isOpen={isFilterModalOpen}
          onClose={handleCloseModal}
          filters={filters}
          onApply={handleApplyFilters}
          onClear={handleClearFilters}
        />
      </div>
    </DashboardShell>
  );
}