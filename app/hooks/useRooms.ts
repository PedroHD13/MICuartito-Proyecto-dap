import { useState, useEffect, useCallback } from 'react';
import { Room, RoomFilters } from '../types';

// Cuartos de ejemplo (para demo)
const SAMPLE_ROOMS: Room[] = [
  {
    id: 1,
    title: "Cuarto amplio cerca UAGRM",
    location: "Zona Norte, 3er Anillo",
    price: 600,
    type: "Privada",
    bathroom: "privado",
    furnished: true,
    capacity: 1,
    services: ["wifi", "agua", "luz"],
    image: "https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto+1"
  },
  {
    id: 2,
    title: "Habitación económica estudiantes",
    location: "Centro, Equipetrol",
    price: 400,
    type: "Compartida",
    bathroom: "compartido",
    furnished: true,
    capacity: 2,
    services: ["agua", "luz", "gas"],
    image: "https://via.placeholder.com/400x300/d9764a/ffffff?text=Cuarto+2"
  },
  {
    id: 3,
    title: "Cuarto con baño privado",
    location: "Zona Este, Av. Alemana",
    price: 750,
    type: "Privada",
    bathroom: "privado",
    furnished: true,
    capacity: 1,
    services: ["wifi", "agua", "luz", "gas"],
    image: "https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto+3"
  },
  {
    id: 4,
    title: "Habitación amoblada centro",
    location: "Centro, Plaza 24 de Septiembre",
    price: 500,
    type: "Privada",
    bathroom: "compartido",
    furnished: true,
    capacity: 1,
    services: ["wifi", "agua", "luz"],
    image: "https://via.placeholder.com/400x300/d9764a/ffffff?text=Cuarto+4"
  },
  {
    id: 5,
    title: "Cuarto grande para pareja",
    location: "Zona Sur, Urubó",
    price: 900,
    type: "Privada",
    bathroom: "privado",
    furnished: true,
    capacity: 2,
    services: ["wifi", "agua", "luz", "gas"],
    image: "https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto+5"
  },
  {
    id: 6,
    title: "Habitación estudiantes UV",
    location: "Zona Oeste, cerca UV",
    price: 350,
    type: "Compartida",
    bathroom: "compartido",
    furnished: false,
    capacity: 3,
    services: ["agua", "luz"],
    image: "https://via.placeholder.com/400x300/d9764a/ffffff?text=Cuarto+6"
  }
];

export function useRooms() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState<RoomFilters>({});
  const [loading, setLoading] = useState(true);

  // Cargar cuartos al iniciar
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = useCallback(() => {
    // Cargar cuartos del localStorage
    const storedRooms = JSON.parse(localStorage.getItem('cuartos') || '[]');
    
    // Convertir cuartos almacenados al formato Room
    const convertedRooms: Room[] = storedRooms.map((room: any, index: number) => ({
      id: 100 + index,
      title: room.titulo || `Cuarto ${room.tipo || 'Privado'}`,
      location: room.ubicacion || room.barrio || 'Ubicación por definir',
      price: parseInt(room.precio) || 0,
      type: room.tipo === 'compartida' ? 'Compartida' : 'Privada',
      bathroom: room.servicios?.includes('baño privado') ? 'privado' : 'compartido',
      furnished: room.servicios?.includes('muebles') || false,
      capacity: parseInt(room.capacidad) || 1,
      services: room.servicios || [],
      image: room.fotos?.[0] || "https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto",
      active: room.active !== undefined ? room.active : true,
      views: room.views || 0,
      createdAt: room.createdAt || new Date().toISOString()
    }));

    // Combinar cuartos de ejemplo con los almacenados
    const all = [...SAMPLE_ROOMS, ...convertedRooms];
    setAllRooms(all);
    setFilteredRooms(all);
    setLoading(false);
  }, []);

  // Aplicar filtros
  const applyFilters = useCallback((newFilters: RoomFilters) => {
    setFilters(newFilters);
    
    let filtered = [...allRooms];

    // Búsqueda por texto
    if (newFilters.searchTerm) {
      const term = newFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(room =>
        room.title.toLowerCase().includes(term) ||
        room.location.toLowerCase().includes(term)
      );
    }

    // Rango de precio
    if (newFilters.priceMin !== undefined && newFilters.priceMin > 0) {
      filtered = filtered.filter(room => room.price >= (newFilters.priceMin || 0));
    }
    if (newFilters.priceMax !== undefined && newFilters.priceMax > 0) {
      filtered = filtered.filter(room => room.price <= (newFilters.priceMax || Infinity));
    }

    // Zona
    if (newFilters.zone) {
      filtered = filtered.filter(room =>
        room.location.toLowerCase().includes(newFilters.zone!.toLowerCase())
      );
    }

    // Baño
    if (newFilters.bathroomPrivate && !newFilters.bathroomShared) {
      filtered = filtered.filter(room => room.bathroom === 'privado');
    } else if (!newFilters.bathroomPrivate && newFilters.bathroomShared) {
      filtered = filtered.filter(room => room.bathroom === 'compartido');
    }

    // Amoblado
    if (newFilters.furnished) {
      filtered = filtered.filter(room => room.furnished);
    }

    // Capacidad
    if (newFilters.capacity) {
      if (newFilters.capacity === '4+') {
        filtered = filtered.filter(room => room.capacity >= 4);
      } else {
        filtered = filtered.filter(room => room.capacity === parseInt(newFilters.capacity!));
      }
    }

    // Servicios
    if (newFilters.services && newFilters.services.length > 0) {
      filtered = filtered.filter(room =>
        newFilters.services!.every(service => room.services.includes(service))
      );
    }

    // Ordenamiento
    if (newFilters.sortBy === 'price-asc') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (newFilters.sortBy === 'price-desc') {
      filtered.sort((a, b) => b.price - a.price);
    }

    setFilteredRooms(filtered);
  }, [allRooms]);

  // Limpiar filtros
  const clearFilters = useCallback(() => {
    setFilters({});
    setFilteredRooms(allRooms);
  }, [allRooms]);

  // Recargar cuartos
  const refreshRooms = useCallback(() => {
    loadRooms();
  }, [loadRooms]);

  return {
    rooms: filteredRooms,
    allRooms,
    loading,
    filters,
    applyFilters,
    clearFilters,
    refreshRooms
  };
}