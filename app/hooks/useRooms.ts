import { useState, useEffect, useCallback } from 'react';
import { Room, RoomFilters } from '../types';


export function useRooms() {
  const [allRooms, setAllRooms] = useState<Room[]>([]);
  const [filteredRooms, setFilteredRooms] = useState<Room[]>([]);
  const [filters, setFilters] = useState<RoomFilters>({});
  const [loading, setLoading] = useState(true);

  // Cargar cuartos al iniciar
  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/cuartos');
      const data = await response.json();
      const rooms: Room[] = data.rooms || [];

      setAllRooms(rooms);
      setFilteredRooms(rooms);
    } catch (error) {
      console.error('Error cargando cuartos:', error);
      setAllRooms([]);
      setFilteredRooms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

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