'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import { useRooms } from '../../hooks/useRooms';
import { useFavorites } from '../../hooks/useFavorites';
import RoomCard from '../../components/RoomCard';
import { Room, RoomFilters } from '../../types';
import '../../styles/buscar-styles.css';

export default function BuscarPage() {
  const router = useRouter();
  const { session, loading } = useRequireAuth('inquilino');
  
  const { rooms, allRooms, filters, applyFilters, clearFilters, refreshRooms } = useRooms();
  const { favoriteIds, toggleFavorite, isFavorite } = useFavorites();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'price-asc' | 'price-desc'>('price-asc');
  const [activeFiltersCount, setActiveFiltersCount] = useState(0);

  // Aplicar búsqueda al cambiar el término
  useEffect(() => {
    applyFilters({ ...filters, searchTerm });
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
    // Por ahora mostrar alerta, luego navegar a detalle
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
  };

  const goToHome = () => router.push('/inquilino');
  const goToFavorites = () => router.push('/inquilino/favoritos');
  const goToProfile = () => router.push('/inquilino/perfil');

  return (
    <>
      {/* Header */}
      <div className="header buscar-header">
        <div className="header-top">
          <button className="back-btn" onClick={goToHome}>←</button>
          <div className="header-title">
            <h1>Buscar Cuartos</h1>
            <p>Encuentra tu espacio ideal</p>
          </div>
        </div>
        <div className="search-bar">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Buscar por zona, barrio..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Filter Button */}
      <div className="filter-section">
        <button 
          className="filter-btn primary" 
          onClick={() => setIsFilterModalOpen(true)}
        >
          🎛️ Filtros
          {activeFiltersCount > 0 && (
            <span className="filter-badge">{activeFiltersCount}</span>
          )}
        </button>
        {activeFiltersCount > 0 && (
          <button 
            className="filter-btn"
            onClick={handleClearFilters}
            style={{ background: '#f44336', color: 'white', borderColor: '#f44336' }}
          >
            ✕ Limpiar
          </button>
        )}
      </div>

      {/* Results Header */}
      <div className="results-header">
        <div className="results-count">
          <strong>{rooms.length}</strong> cuartos disponibles
        </div>
        <button className="sort-btn" onClick={handleSort}>
          <span>{sortBy === 'price-asc' ? '⬆️' : '⬇️'}</span>
          <span>{sortBy === 'price-asc' ? 'Menor precio' : 'Mayor precio'}</span>
        </button>
      </div>

      {/* Rooms List */}
      <div className="rooms-container">
        {rooms.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
            <div style={{ fontSize: '3em', marginBottom: '15px' }}>😔</div>
            <h3 style={{ marginBottom: '10px' }}>No se encontraron cuartos</h3>
            <p>Intenta ajustar los filtros de búsqueda</p>
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

      {/* Filter Modal */}
      {isFilterModalOpen && (
        <div className="filter-modal active" onClick={() => setIsFilterModalOpen(false)}>
          <div className="filter-content" onClick={(e) => e.stopPropagation()}>
            <div className="filter-scrollable">
              <div className="filter-header">
                <h2>Filtros</h2>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button 
                    className="btn-clear" 
                    onClick={handleClearFilters}
                  >
                    Limpiar
                  </button>
                  <button 
                    className="btn-apply" 
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    ✅ Aplicar
                  </button>
                  <button 
                    className="close-filter" 
                    onClick={() => setIsFilterModalOpen(false)}
                  >
                    ×
                  </button>
                </div>
              </div>

              {/* Precio */}
              <div className="filter-group">
                <div className="filter-group-title">💰 Rango de Precio (Bs.)</div>
                <div className="price-inputs">
                  <input
                    type="number"
                    placeholder="Mín"
                    value={filters.priceMin || ''}
                    onChange={(e) => applyFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Máx"
                    value={filters.priceMax || ''}
                    onChange={(e) => applyFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                  />
                </div>
              </div>

              {/* Zona */}
              <div className="filter-group">
                <div className="filter-group-title">📍 Zona</div>
                <select
                  value={filters.zone || ''}
                  onChange={(e) => applyFilters({ ...filters, zone: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                >
                  <option value="">Todas las zonas</option>
                  <option value="norte">Zona Norte</option>
                  <option value="sur">Zona Sur</option>
                  <option value="este">Zona Este</option>
                  <option value="oeste">Zona Oeste</option>
                  <option value="centro">Centro</option>
                </select>
              </div>

              {/* Baño */}
              <div className="filter-group">
                <div className="filter-group-title">🚿 Tipo de Baño</div>
                <div className="checkbox-list">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.bathroomPrivate || false}
                      onChange={(e) => applyFilters({ ...filters, bathroomPrivate: e.target.checked })}
                    />
                    <span>Baño privado</span>
                  </label>
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.bathroomShared || false}
                      onChange={(e) => applyFilters({ ...filters, bathroomShared: e.target.checked })}
                    />
                    <span>Baño compartido</span>
                  </label>
                </div>
              </div>

              {/* Amoblado */}
              <div className="filter-group">
                <div className="filter-group-title">🛋️ Mobiliario</div>
                <div className="checkbox-list">
                  <label className="checkbox-item">
                    <input
                      type="checkbox"
                      checked={filters.furnished || false}
                      onChange={(e) => applyFilters({ ...filters, furnished: e.target.checked })}
                    />
                    <span>Amoblado</span>
                  </label>
                </div>
              </div>

              {/* Servicios */}
              <div className="filter-group">
                <div className="filter-group-title">✨ Servicios Incluidos</div>
                <div className="checkbox-list">
                  {[
                    { value: 'wifi', label: '📶 WiFi' },
                    { value: 'agua', label: '💧 Agua' },
                    { value: 'luz', label: '💡 Luz' },
                    { value: 'gas', label: '🔥 Gas' }
                  ].map(service => (
                    <label key={service.value} className="checkbox-item">
                      <input
                        type="checkbox"
                        checked={(filters.services || []).includes(service.value)}
                        onChange={() => {
                          const current = filters.services || [];
                          const updated = current.includes(service.value)
                            ? current.filter(s => s !== service.value)
                            : [...current, service.value];
                          applyFilters({ ...filters, services: updated });
                        }}
                      />
                      <span>{service.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Capacidad */}
              <div className="filter-group">
                <div className="filter-group-title">👥 Capacidad</div>
                <select
                  value={filters.capacity || ''}
                  onChange={(e) => applyFilters({ ...filters, capacity: e.target.value })}
                  style={{ width: '100%', padding: '10px', border: '2px solid #e0e0e0', borderRadius: '8px' }}
                >
                  <option value="">Cualquier capacidad</option>
                  <option value="1">1 persona</option>
                  <option value="2">2 personas</option>
                  <option value="3">3 personas</option>
                  <option value="4">4 personas</option>
                  <option value="4+">4 o más personas</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={goToHome}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Inicio</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon">🔍</span>
          <span className="nav-label">Buscar</span>
        </button>
        <button className="nav-item" onClick={goToFavorites}>
          <span className="nav-icon">❤️</span>
          <span className="nav-label">Favoritos</span>
        </button>
        <button className="nav-item" onClick={goToProfile}>
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </div>
    </>
  );
}