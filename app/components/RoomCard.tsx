'use client';

import { Room } from '../types';
import AppIcon from './AppIcon';

interface RoomCardProps {
  room: Room;
  isFavorite: boolean;
  onToggleFavorite: (roomId: number) => void;
  onViewDetail: (room: Room) => void;
  onContact: (room: Room) => void;
}

export default function RoomCard({
  room,
  isFavorite,
  onToggleFavorite,
  onViewDetail,
  onContact
}: RoomCardProps) {
  return (
    <div className="room-card" onClick={() => onViewDetail(room)}>
      <div className="room-image">
        <img 
          src={room.image} 
          alt={room.title}
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300/2563a8/ffffff?text=Cuarto';
          }}
        />
        <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(room.id);
          }}
        >
          <AppIcon name="heart" />
        </button>
        <span className="room-badge">{room.type}</span>
      </div>
      <div className="room-info">
        <div className="room-title">{room.title}</div>
        <div className="room-location"><AppIcon name="building" /> {room.location}</div>
        <div className="room-features">
          <span className="feature"><AppIcon name="userGroup" /> {room.capacity} {room.capacity > 1 ? 'personas' : 'persona'}</span>
          <span className="feature"><AppIcon name="shower" /> {room.bathroom === 'privado' ? 'Baño privado' : 'Baño compartido'}</span>
          {room.furnished && <span className="feature"><AppIcon name="building" /> Amoblado</span>}
        </div>
        <div className="room-footer">
          <div className="room-price">
            Bs. {room.price}
            <span>/mes</span>
          </div>
          <button 
            className="contact-btn"
            onClick={(e) => {
              e.stopPropagation();
              onContact(room);
            }}
          >
            Contactar
          </button>
        </div>
      </div>
    </div>
  );
}