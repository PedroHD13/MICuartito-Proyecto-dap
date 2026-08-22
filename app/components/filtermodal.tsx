'use client';

import { RoomFilters } from '../types';
import { useEffect } from 'react';

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  filters: RoomFilters;
  onApply: (filters: RoomFilters) => void;
  onClear: () => void;
}

export default function FilterModal({
  isOpen,
  onClose,
  filters,
  onApply,
  onClear
}: FilterModalProps) {
  // Bloquear scroll cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="filter-modal-overlay" 
      onClick={handleBackdropClick}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        animation: 'fadeIn 0.3s ease'
      }}
    >
      <div 
        className="filter-modal-panel"
        onClick={(e) => e.stopPropagation()}
        style={{
          backgroundColor: 'white',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '80vh',
          borderRadius: '20px 20px 0 0',
          animation: 'slideUp 0.3s ease',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.3)',
          position: 'relative'
        }}
      >
        {/* Indicador de arrastre */}
        <div style={{
          width: '40px',
          height: '4px',
          backgroundColor: '#d1d5db',
          borderRadius: '2px',
          margin: '10px auto 0',
          flexShrink: 0
        }} />

        {/* Header */}
        <div className="filter-modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 20px 12px 20px',
          borderBottom: '2px solid #f0f0f0',
          flexShrink: 0
        }}>
          <h2 style={{
            fontSize: '1.2em',
            color: '#1f2937',
            margin: 0,
            fontWeight: 700
          }}>
            🎛️ Filtros
          </h2>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={onClear}
              style={{
                padding: '6px 14px',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8em',
                color: '#6b7280',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D8C7A6';
                e.currentTarget.style.color = '#8A7554';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#6b7280';
              }}
            >
              Limpiar
            </button>
            <button
              onClick={onClose}
              style={{
                padding: '6px 16px',
                background: '#1A3B5D',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                cursor: 'pointer',
                fontSize: '0.8em',
                transition: 'all 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              ✅ Aplicar
            </button>
            <button
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1.5em',
                cursor: 'pointer',
                color: '#9ca3af',
                padding: '0 4px',
                lineHeight: '1',
                transition: 'all 0.2s',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#f3f4f6';
                e.currentTarget.style.color = '#1f2937';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = '#9ca3af';
              }}
            >
              ×
            </button>
          </div>
        </div>

        {/* Body - scrollable */}
        <div className="filter-modal-body" style={{
          padding: '20px 20px 30px 20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {/* Precio */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              💰 Rango de Precio (Bs.)
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <input
                type="number"
                placeholder="Mín"
                value={filters.priceMin || ''}
                onChange={(e) => onApply({ 
                  ...filters, 
                  priceMin: e.target.value ? Number(e.target.value) : undefined 
                })}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9em',
                  background: '#fafafa',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D8C7A6';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(216,199,166,0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              <span style={{ color: '#6b7280', fontWeight: 600 }}>-</span>
              <input
                type="number"
                placeholder="Máx"
                value={filters.priceMax || ''}
                onChange={(e) => onApply({ 
                  ...filters, 
                  priceMax: e.target.value ? Number(e.target.value) : undefined 
                })}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  fontSize: '0.9em',
                  background: '#fafafa',
                  transition: 'all 0.2s',
                  outline: 'none'
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = '#D8C7A6';
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.boxShadow = '0 0 0 4px rgba(216,199,166,0.25)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fafafa';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Zona */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              📍 Zona
            </div>
            <select
              value={filters.zone || ''}
              onChange={(e) => onApply({ ...filters, zone: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9em',
                background: '#fafafa',
                transition: 'all 0.2s',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '40px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D8C7A6';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(216,199,166,0.25)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
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
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              🚿 Tipo de Baño
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#fafafa',
                margin: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D8C7A6';
                e.currentTarget.style.background = '#fff8f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fafafa';
              }}>
                <input
                  type="checkbox"
                  checked={filters.bathroomPrivate || false}
                  onChange={(e) => onApply({ 
                    ...filters, 
                    bathroomPrivate: e.target.checked 
                  })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#D8C7A6',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.9em', color: '#1f2937', cursor: 'pointer', fontWeight: 500 }}>
                  Baño privado
                </span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                background: '#fafafa',
                margin: 0
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D8C7A6';
                e.currentTarget.style.background = '#fff8f5';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fafafa';
              }}>
                <input
                  type="checkbox"
                  checked={filters.bathroomShared || false}
                  onChange={(e) => onApply({ 
                    ...filters, 
                    bathroomShared: e.target.checked 
                  })}
                  style={{
                    width: '18px',
                    height: '18px',
                    accentColor: '#D8C7A6',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                />
                <span style={{ fontSize: '0.9em', color: '#1f2937', cursor: 'pointer', fontWeight: 500 }}>
                  Baño compartido
                </span>
              </label>
            </div>
          </div>

          {/* Amoblado */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              🛋️ Mobiliario
            </div>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '10px 14px',
              border: '2px solid #e5e7eb',
              borderRadius: '10px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              background: '#fafafa',
              margin: 0
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#D8C7A6';
              e.currentTarget.style.background = '#fff8f5';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#e5e7eb';
              e.currentTarget.style.background = '#fafafa';
            }}>
              <input
                type="checkbox"
                checked={filters.furnished || false}
                onChange={(e) => onApply({ 
                  ...filters, 
                  furnished: e.target.checked 
                })}
                style={{
                  width: '18px',
                  height: '18px',
                  accentColor: '#D8C7A6',
                  cursor: 'pointer',
                  flexShrink: 0
                }}
              />
              <span style={{ fontSize: '0.9em', color: '#1f2937', cursor: 'pointer', fontWeight: 500 }}>
                Amoblado
              </span>
            </label>
          </div>

          {/* Servicios */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              ✨ Servicios Incluidos
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { value: 'wifi', label: '📶 WiFi' },
                { value: 'agua', label: '💧 Agua' },
                { value: 'luz', label: '💡 Luz' },
                { value: 'gas', label: '🔥 Gas' }
              ].map(service => (
                <label key={service.value} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '10px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  background: '#fafafa',
                  margin: 0
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D8C7A6';
                  e.currentTarget.style.background = '#fff8f5';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.background = '#fafafa';
                }}>
                  <input
                    type="checkbox"
                    checked={(filters.services || []).includes(service.value)}
                    onChange={() => {
                      const current = filters.services || [];
                      const updated = current.includes(service.value)
                        ? current.filter(s => s !== service.value)
                        : [...current, service.value];
                      onApply({ ...filters, services: updated });
                    }}
                    style={{
                      width: '18px',
                      height: '18px',
                      accentColor: '#D8C7A6',
                      cursor: 'pointer',
                      flexShrink: 0
                    }}
                  />
                  <span style={{ fontSize: '0.9em', color: '#1f2937', cursor: 'pointer', fontWeight: 500 }}>
                    {service.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Capacidad */}
          <div style={{ marginBottom: 0 }}>
            <div style={{
              fontSize: '0.95em',
              fontWeight: 700,
              color: '#1f2937',
              marginBottom: '10px',
              paddingBottom: '6px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              👥 Capacidad
            </div>
            <select
              value={filters.capacity || ''}
              onChange={(e) => onApply({ ...filters, capacity: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 14px',
                border: '2px solid #e5e7eb',
                borderRadius: '10px',
                fontSize: '0.9em',
                background: '#fafafa',
                transition: 'all 0.2s',
                outline: 'none',
                cursor: 'pointer',
                appearance: 'none',
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E\")",
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 14px center',
                paddingRight: '40px'
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = '#D8C7A6';
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.boxShadow = '0 0 0 4px rgba(216,199,166,0.25)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.background = '#fafafa';
                e.currentTarget.style.boxShadow = 'none';
              }}
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

      {/* Estilos de animación inline */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            transform: translateY(100%);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}