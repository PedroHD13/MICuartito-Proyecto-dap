'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import { useFavorites, FavoriteWithDate } from '../../hooks/useFavorites';
import DashboardShell from '../../components/DashboardShell';
import { Room } from '../../types';
import '../../styles/favoritos-styles.css';
import AppIcon, { AppIconName } from '../../components/AppIcon';

export default function FavoritosPage() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('inquilino');
  const {
    favoriteRoomsWithDate,
    removeFavorite,
    clearFavorites,
  } = useFavorites();

  const [favoriteRooms, setFavoriteRooms] = useState<FavoriteWithDate[]>([]);
  const [sortBy, setSortBy] = useState<'recent' | 'price-asc' | 'price-desc'>('recent');
  const [selectedForCompare, setSelectedForCompare] = useState<number[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [sortMenuOpen, setSortMenuOpen] = useState(false);

  const compareResultRef = useRef<HTMLDivElement>(null);

  const sortFavorites = useCallback((sortType: 'recent' | 'price-asc' | 'price-desc') => {
    setFavoriteRooms(prev => {
      const sorted = [...prev];
      switch (sortType) {
        case 'price-asc':
          sorted.sort((a, b) => a.price - b.price);
          break;
        case 'price-desc':
          sorted.sort((a, b) => b.price - a.price);
          break;
        case 'recent':
          sorted.sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime());
          break;
      }
      return sorted;
    });
  }, []);

  // Sincronizar cuando cambian los favoritos que vienen de la API
  useEffect(() => {
    setFavoriteRooms(favoriteRoomsWithDate);
  }, [favoriteRoomsWithDate]);

  // Ordenar favoritos cuando cambia el criterio
  useEffect(() => {
    if (favoriteRooms.length > 0) {
      sortFavorites(sortBy);
    }
  }, [sortBy, favoriteRooms.length]);

  if (loading || !session) {
    return null;
  }

  const handleRemoveFavorite = (roomId: number) => {
    removeFavorite(roomId);
    setFavoriteRooms(prev => prev.filter(room => room.id !== roomId));
  };

  const handleClearAll = () => {
    if (favoriteRooms.length === 0) return;
    if (confirm(`¿Eliminar todos tus ${favoriteRooms.length} favoritos?`)) {
      clearFavorites();
      setFavoriteRooms([]);
      setSelectedForCompare([]);
    }
  };

  const handleToggleCompare = (roomId: number) => {
    setSelectedForCompare(prev => {
      if (prev.includes(roomId)) {
        return prev.filter(id => id !== roomId);
      } else {
        if (prev.length >= 3) {
          alert('⚠️ Solo puedes comparar hasta 3 cuartos a la vez');
          return prev;
        }
        return [...prev, roomId];
      }
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length < 2) {
      alert('⚠️ Selecciona al menos 2 cuartos para comparar');
      return;
    }
    setShowCompareModal(true);
  };

  const handleSortChange = (newSort: 'recent' | 'price-asc' | 'price-desc') => {
    setSortBy(newSort);
    setSortMenuOpen(false);
  };

  const getSortLabel = () => {
    switch (sortBy) {
      case 'price-asc': return 'Menor precio';
      case 'price-desc': return 'Mayor precio';
      default: return 'Recientes';
    }
  };

  const getSortIcon = (): AppIconName => {
    switch (sortBy) {
      case 'price-asc': return 'arrowUp';
      case 'price-desc': return 'arrowDown';
      default: return 'clock';
    }
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  // Calcular estadísticas
  const totalFavorites = favoriteRooms.length;
  const prices = favoriteRooms.map(r => r.price);
  const avgPrice = totalFavorites > 0 ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length) : 0;
  const minPrice = totalFavorites > 0 ? Math.min(...prices) : 0;
  const maxPrice = totalFavorites > 0 ? Math.max(...prices) : 0;

  const goToSearch = () => router.push('/inquilino/buscar');

  // Vista de detalle
  const handleViewDetail = (room: Room) => {
    alert(`Detalles del Cuarto:\n\n` +
      `${room.title}\n` +
      `${room.location}\n\n` +
      `Precio: Bs. ${room.price}/mes\n` +
      `Tipo: ${room.type}\n` +
      `Capacidad: ${room.capacity} persona(s)\n` +
      `Baño: ${room.bathroom === 'privado' ? 'Privado' : 'Compartido'}\n` +
      `${room.furnished ? 'Amoblado\n' : ''}\n` +
      `Servicios: ${room.services.join(', ')}`
    );
  };

  const handleContact = (room: Room) => {
    router.push('/contacto-whatsapp');
  };

  // 🔧 Función para renderizar la tabla de comparación con return type explícito
  const renderCompareTable = (): string => {
    const selectedRooms = favoriteRooms.filter(r => selectedForCompare.includes(r.id));
    
    // Si no hay suficientes seleccionados, devolver un mensaje
    if (selectedRooms.length < 2) {
      return '<p style="text-align:center; color:#666;">Selecciona al menos 2 cuartos para comparar</p>';
    }

    const minPrice = Math.min(...selectedRooms.map(r => r.price));
    
    const headers = selectedRooms.map(r => 
      `<th>${r.title.length > 18 ? r.title.substring(0,18)+'...' : r.title}</th>`
    ).join('');

    const rows = [
      {
        label: 'Precio/mes',
        values: selectedRooms.map(r => 
          `<td class="${r.price === minPrice ? 'highlight-best' : ''}">Bs. ${r.price}</td>`
        )
      },
      {
        label: 'Ubicación',
        values: selectedRooms.map(r => `<td>${r.location}</td>`)
      },
      {
        label: 'Baño',
        values: selectedRooms.map(r => 
          `<td>${r.bathroom === 'privado' ? 'Privado' : 'Compartido'}</td>`
        )
      },
      {
        label: 'Amoblado',
        values: selectedRooms.map(r => 
          `<td>${r.furnished ? 'Sí' : 'No'}</td>`
        )
      },
      {
        label: 'Capacidad',
        values: selectedRooms.map(r => `<td>${r.capacity} persona(s)</td>`)
      },
      {
        label: 'Servicios',
        values: selectedRooms.map(r => `<td>${r.services.length} incluidos</td>`)
      }
    ];

    const tableRows = rows.map(row =>
      `<tr><td>${row.label}</td>${row.values.join('')}</tr>`
    ).join('');

    return `
      <h3 style="text-align:center; color:#333; margin-bottom:15px; font-size:1em;">
        Comparación lado a lado
      </h3>
      <div style="overflow-x:auto;">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Característica</th>
              ${headers}
            </tr>
          </thead>
          <tbody>${tableRows}</tbody>
        </table>
      </div>
      <p style="text-align:center; font-size:0.8em; color:#999; margin-top:10px;">
        Precio en <span style="color:#2563a8; font-weight:700;">azul</span> = más económico
      </p>
    `;
  };

  // 🔧 Función para mostrar la comparación usando useRef
  const handleShowComparison = () => {
    if (compareResultRef.current) {
      compareResultRef.current.innerHTML = renderCompareTable();
    }
  };

  return (
    <DashboardShell role="inquilino" userName={session.name} onLogout={handleLogout}>
      <div className="page-content favoritos-page">
        <div className="page-header">
          <h1>Mis Favoritos</h1>
          <p>Cuartos que guardaste</p>
        </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="heart" /></div>
          <div className="stat-info">
            <div className="stat-number">{totalFavorites}</div>
            <div className="stat-label">Favoritos</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="moneyBill" /></div>
          <div className="stat-info">
            <div className="stat-number">Bs. {avgPrice}</div>
            <div className="stat-label">Precio Promedio</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon"><AppIcon name="listCheck" /></div>
          <div className="stat-info">
            <div className="stat-number">{totalFavorites > 0 ? `${minPrice}-${maxPrice}` : '-'}</div>
            <div className="stat-label">Rango</div>
          </div>
        </div>
      </div>

      {/* Filter Options */}
      <div className="filter-options">
        <button 
          className="sort-btn" 
          onClick={() => setSortMenuOpen(!sortMenuOpen)}
        >
          <span><AppIcon name={getSortIcon()} /></span>
          <span>{getSortLabel()}</span>
          <span><AppIcon name="chevronDown" /></span>
        </button>
        {totalFavorites > 0 && (
          <button className="clear-all-btn" onClick={handleClearAll}>
            <AppIcon name="trash" /> Limpiar Todo
          </button>
        )}
      </div>

      {/* Sort Menu */}
      {sortMenuOpen && (
        <div className="sort-menu active">
          <button 
            className="sort-option" 
            onClick={() => handleSortChange('recent')}
          >
            <AppIcon name="clock" /> Agregados Recientemente
          </button>
          <button 
            className="sort-option" 
            onClick={() => handleSortChange('price-asc')}
          >
            <AppIcon name="moneyBill" /> Precio: Menor a Mayor
          </button>
          <button 
            className="sort-option" 
            onClick={() => handleSortChange('price-desc')}
          >
            <AppIcon name="moneyBill" /> Precio: Mayor a Menor
          </button>
        </div>
      )}

      {/* Favorites List */}
      <div className="favorites-container">
        {totalFavorites === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><AppIcon name="heart" /></div>
            <h3>No tienes favoritos</h3>
            <p>Empieza a guardar cuartos que te interesen para compararlos después</p>
            <button className="btn-primary" onClick={goToSearch}>
              <AppIcon name="magnifyingGlass" /> Buscar Cuartos
            </button>
          </div>
        ) : (
          <>
            {favoriteRooms.map(room => {
              const addedDate = new Date(room.addedDate);
              const formattedDate = addedDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: 'short'
              });

              return (
                <div key={room.id} className="favorite-card">
                  <div className="favorite-card-header">
                    <img 
                      src={room.image} 
                      alt={room.title}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto';
                      }}
                    />
                    <div className="compare-select-wrapper">
                      <input
                        type="checkbox"
                        className="compare-checkbox"
                        checked={selectedForCompare.includes(room.id)}
                        onChange={() => handleToggleCompare(room.id)}
                        title="Seleccionar para comparar"
                      />
                    </div>
                    <button 
                      className="remove-favorite-btn" 
                      onClick={() => handleRemoveFavorite(room.id)}
                      title="Quitar de favoritos"
                    >
                      <AppIcon name="heart" />
                    </button>
                    <span className="favorite-badge">{room.type}</span>
                    <span className="added-date">Agregado: {formattedDate}</span>
                  </div>
                  <div className="favorite-card-body">
                    <div className="favorite-card-title">{room.title}</div>
                    <div className="favorite-card-location"><AppIcon name="building" /> {room.location}</div>
                    <div className="favorite-card-features">
                      <div className="feature-item"><AppIcon name="userGroup" /> {room.capacity} persona(s)</div>
                      <div className="feature-item"><AppIcon name="shower" /> {room.bathroom === 'privado' ? 'Baño privado' : 'Baño compartido'}</div>
                      {room.furnished && <div className="feature-item"><AppIcon name="couch" /> Amoblado</div>}
                    </div>
                    <div className="favorite-card-footer">
                      <div className="favorite-card-price">
                        Bs. {room.price}<span>/mes</span>
                      </div>
                      <div className="favorite-actions">
                        <button className="action-btn btn-view" onClick={() => handleViewDetail(room)}>
                          <AppIcon name="eye" /> Ver
                        </button>
                        <button className="action-btn btn-contact" onClick={() => handleContact(room)}>
                          <AppIcon name="envelope" /> Contactar
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Botón Comparar Flotante */}
      {totalFavorites >= 2 && (
        <button 
          className="compare-floating-btn" 
          onClick={handleCompare}
        >
          <AppIcon name="listCheck" />
          <span className="compare-btn-text">Comparar</span>
          {selectedForCompare.length > 0 && (
            <span className="compare-badge">{selectedForCompare.length}</span>
          )}
        </button>
      )}

      {/* Modal de Comparación */}
      {showCompareModal && (
        <div className="modal active" onClick={() => setShowCompareModal(false)}>
          <div className="modal-content modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2><AppIcon name="listCheck" /> Comparar Cuartos</h2>
              <button className="close-modal" onClick={() => setShowCompareModal(false)} aria-label="Cerrar"><AppIcon name="xmark" /></button>
            </div>
            <div className="modal-body">
              <div className="compare-grid">
                {favoriteRooms.map(room => (
                  <div 
                    key={room.id} 
                    className={`compare-item ${selectedForCompare.includes(room.id) ? 'selected' : ''}`}
                    onClick={() => handleToggleCompare(room.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedForCompare.includes(room.id)}
                      onChange={() => {}}
                      style={{ width: '22px', height: '22px', accentColor: '#2563a8' }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', color: '#333', marginBottom: '4px' }}>
                        {room.title.length > 30 ? room.title.substring(0, 30) + '...' : room.title}
                      </div>
                      <div style={{ fontSize: '0.85em', color: '#666' }}><AppIcon name="building" /> {room.location}</div>
                      <div style={{ fontSize: '1em', fontWeight: '700', color: '#8A7554', marginTop: '4px' }}>
                        Bs. {room.price}/mes
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedForCompare.length >= 2 && (
                <button 
                  className="btn-do-compare"
                  onClick={handleShowComparison}
                >
                  <AppIcon name="listCheck" /> Comparar seleccionados
                </button>
              )}

              {/* 🔧 Usar ref en lugar de getElementById */}
              <div ref={compareResultRef} id="compare-result"></div>
            </div>
          </div>
        </div>
      )}

      </div>
    </DashboardShell>
  );
}