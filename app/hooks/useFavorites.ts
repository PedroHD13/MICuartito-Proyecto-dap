import { useState, useEffect, useCallback } from 'react';
import { useSession } from '../../useSession';
import { Room } from '../types';

export interface FavoriteWithDate extends Room {
  addedDate: string;
}

export function useFavorites() {
  const { session } = useSession();
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [favoriteRoomsWithDate, setFavoriteRoomsWithDate] = useState<FavoriteWithDate[]>([]);
  const [loading, setLoading] = useState(true);

  const loadFavorites = useCallback(async () => {
    if (!session) {
      setFavoriteIds([]);
      setFavoriteRoomsWithDate([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch(`/api/favoritos?username=${session.username}`);
      const data = await response.json();
      setFavoriteIds(data.favoriteIds || []);
      setFavoriteRoomsWithDate(data.rooms || []);
    } catch (error) {
      console.error('Error cargando favoritos:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  const toggleFavorite = useCallback(async (roomId: number) => {
    if (!session) return;
    const isCurrentlyFavorite = favoriteIds.includes(roomId);

    // Actualización optimista para que se sienta instantáneo
    setFavoriteIds(prev =>
      isCurrentlyFavorite ? prev.filter(id => id !== roomId) : [...prev, roomId]
    );

    try {
      if (isCurrentlyFavorite) {
        await fetch(`/api/favoritos?username=${session.username}&cuartoId=${roomId}`, {
          method: 'DELETE',
        });
      } else {
        await fetch('/api/favoritos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: session.username, cuartoId: roomId }),
        });
      }
      await loadFavorites();
    } catch (error) {
      console.error('Error actualizando favorito:', error);
    }
  }, [session, favoriteIds, loadFavorites]);

  const isFavorite = useCallback(
    (roomId: number) => favoriteIds.includes(roomId),
    [favoriteIds]
  );

  const removeFavorite = useCallback(async (roomId: number) => {
    if (!session) return;
    setFavoriteIds(prev => prev.filter(id => id !== roomId));
    setFavoriteRoomsWithDate(prev => prev.filter(r => r.id !== roomId));
    try {
      await fetch(`/api/favoritos?username=${session.username}&cuartoId=${roomId}`, {
        method: 'DELETE',
      });
    } catch (error) {
      console.error('Error eliminando favorito:', error);
    }
  }, [session]);

  const clearFavorites = useCallback(async () => {
    if (!session) return;
    const idsToRemove = [...favoriteIds];
    setFavoriteIds([]);
    setFavoriteRoomsWithDate([]);
    try {
      await Promise.all(
        idsToRemove.map(id =>
          fetch(`/api/favoritos?username=${session.username}&cuartoId=${id}`, { method: 'DELETE' })
        )
      );
    } catch (error) {
      console.error('Error limpiando favoritos:', error);
    }
  }, [session, favoriteIds]);

  return {
    favoriteIds,
    favoriteRoomsWithDate,
    loading,
    toggleFavorite,
    isFavorite,
    removeFavorite,
    clearFavorites,
    refreshFavorites: loadFavorites,
  };
}