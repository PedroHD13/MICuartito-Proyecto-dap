import { useState, useEffect, useCallback } from 'react';
import { Room } from '../types';

export interface FavoriteWithDate extends Room {
  addedDate: string;
}

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteRoomsWithDate, setFavoriteRoomsWithDate] = useState<FavoriteWithDate[]>([]);

  // Cargar favoritos al iniciar
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('favoriteRooms') || '[]');
    setFavoriteIds(saved);
  }, []);

  const toggleFavorite = useCallback((roomId: number) => {
    setFavoriteIds(prev => {
      let newIds;
      if (prev.includes(roomId)) {
        newIds = prev.filter(id => id !== roomId);
      } else {
        newIds = [...prev, roomId];
      }
      
      localStorage.setItem('favoriteRooms', JSON.stringify(newIds));
      return newIds;
    });
  }, []);

  const isFavorite = useCallback((roomId: number) => {
    return favoriteIds.includes(roomId);
  }, [favoriteIds]);

  const getFavoriteRooms = useCallback((allRooms: Room[]): FavoriteWithDate[] => {
    // Obtener fecha de agregado del localStorage
    const favoritesWithDate = JSON.parse(localStorage.getItem('favoritesWithDate') || '{}');
    
    return allRooms
      .filter(room => favoriteIds.includes(room.id))
      .map(room => ({
        ...room,
        addedDate: favoritesWithDate[room.id] || new Date().toISOString()
      }));
  }, [favoriteIds]);

  const removeFavorite = useCallback((roomId: number) => {
    setFavoriteIds(prev => {
      const newIds = prev.filter(id => id !== roomId);
      localStorage.setItem('favoriteRooms', JSON.stringify(newIds));
      
      // También eliminar la fecha
      const favoritesWithDate = JSON.parse(localStorage.getItem('favoritesWithDate') || '{}');
      delete favoritesWithDate[roomId];
      localStorage.setItem('favoritesWithDate', JSON.stringify(favoritesWithDate));
      
      return newIds;
    });
  }, []);

  const clearFavorites = useCallback(() => {
    setFavoriteIds([]);
    localStorage.setItem('favoriteRooms', JSON.stringify([]));
    localStorage.setItem('favoritesWithDate', JSON.stringify({}));
  }, []);

  // Actualizar fecha cuando se agrega un favorito
  const addFavoriteWithDate = useCallback((roomId: number) => {
    setFavoriteIds(prev => {
      if (prev.includes(roomId)) return prev;
      
      const newIds = [...prev, roomId];
      localStorage.setItem('favoriteRooms', JSON.stringify(newIds));
      
      // Guardar fecha de agregado
      const favoritesWithDate = JSON.parse(localStorage.getItem('favoritesWithDate') || '{}');
      favoritesWithDate[roomId] = new Date().toISOString();
      localStorage.setItem('favoritesWithDate', JSON.stringify(favoritesWithDate));
      
      return newIds;
    });
  }, []);

  return {
    favoriteIds,
    favoriteRoomsWithDate,
    toggleFavorite,
    isFavorite,
    getFavoriteRooms,
    removeFavorite,
    clearFavorites,
    addFavoriteWithDate
  };
}