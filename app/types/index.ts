export interface Room {
  id: number;
  title: string;
  location: string;
  price: number;
  type: 'Privada' | 'Compartida';
  bathroom: 'privado' | 'compartido';
  furnished: boolean;
  capacity: number;
  services: string[];
  image: string;
  active?: boolean;
  views?: number;
  createdAt?: string;
}

export interface RoomFilters {
  searchTerm?: string;
  priceMin?: number;
  priceMax?: number;
  zone?: string;
  bathroomPrivate?: boolean;
  bathroomShared?: boolean;
  furnished?: boolean;
  capacity?: string;
  services?: string[];
  sortBy?: 'price-asc' | 'price-desc';
}

export interface FavoriteRoom extends Room {
  addedDate: string;
}