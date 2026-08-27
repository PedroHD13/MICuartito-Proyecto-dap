'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useRequireAuth } from '../../../../useSession';
import DashboardShell from '../../../components/DashboardShell';
import '../../../styles/cuarto-detalle-styles.css';
import AppIcon from '../../../components/AppIcon';

interface RoomDetail {
  id: number;
  title: string;
  location: string;
  price: number;
  type: string;
  bathroom: string;
  capacity: string;
  services: string[];
  cercaDe: string[];
  universidadCercana: string | null;
  reglas: string | null;
  disponibilidad: string;
  images: string[];
  views: number;
  owner: {
    name: string;
    username: string;
    phone: string | null;
  };
}

const SERVICE_LABELS: Record<string, string> = {
  wifi: 'WiFi',
  agua: 'Agua',
  luz: 'Luz',
  gas: 'Gas',
  muebles: 'Muebles',
  cocina: 'Cocina',
  lavanderia: 'Lavandería',
  parking: 'Parqueo',
};

const CERCA_LABELS: Record<string, string> = {
  universidad: 'Universidad',
  transporte: 'Transporte público',
  mercados: 'Mercados',
  hospital: 'Hospital',
  farmacias: 'Farmacias',
};

export default function CuartoDetallePage() {
  const router = useRouter();
  const params = useParams();
  const { session, loading: authLoading, logout } = useRequireAuth('inquilino');

  const [room, setRoom] = useState<RoomDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [showContactPanel, setShowContactPanel] = useState(false);

  useEffect(() => {
    const loadRoom = async () => {
      try {
        const response = await fetch(`/api/cuartos/${params.id}`);
        const data = await response.json();

        if (!response.ok) {
          setRoom(null);
          return;
        }

        setRoom(data.room);
      } catch (error) {
        console.error('Error cargando el cuarto:', error);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) loadRoom();
  }, [params.id]);

  if (authLoading || !session) {
    return null;
  }

    

    const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  const whatsappLink = room?.owner.phone
    ? `https://wa.me/${room.owner.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
        `Hola ${room.owner.name}, vi tu publicación "${room?.title}" en MiCuartito y me interesa. ¿Sigue disponible?`
      )}`
    : null;

  return (
    <DashboardShell role="inquilino" userName={session.name} onLogout={handleLogout}>
      <div className="detalle-page">
        <button className="detalle-back-btn" onClick={() => router.back()}>
          <AppIcon name="arrowLeft" /> Volver
        </button>

        {loading ? (
          <div className="detalle-loading">Cargando información del cuarto...</div>
        ) : !room ? (
          <div className="detalle-not-found">
            <h3>No se encontró este cuarto</h3>
            <p>Puede que ya no esté disponible.</p>
            <button className="btn-primary" onClick={() => router.push('/inquilino/buscar')}>
              Volver a buscar
            </button>
          </div>
        ) : (
          <>
            {/* Galería de fotos */}
            <div className="detalle-gallery">
              <img src={room.images[activeImage]} alt={room.title} className="detalle-main-image" />
              {room.images.length > 1 && (
                <div className="detalle-thumbnails">
                  {room.images.map((img, index) => (
                    <button
                      key={index}
                      className={`detalle-thumb ${index === activeImage ? 'active' : ''}`}
                      onClick={() => setActiveImage(index)}
                    >
                      <img src={img} alt={`Foto ${index + 1}`} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info principal */}
            <div className="detalle-content">
              <div className="detalle-header">
                <div>
                  <h1>{room.title}</h1>
                  <p className="detalle-location">
                    <AppIcon name="building" /> {room.location}
                  </p>
                </div>
                <div className="detalle-price">
                  Bs. {room.price}
                  <span>/mes</span>
                </div>
              </div>

              <div className="detalle-badges">
                <span className="detalle-badge">{room.type}</span>
                <span className="detalle-badge">
                  <AppIcon name="shower" /> Baño {room.bathroom === 'privado' ? 'privado' : 'compartido'}
                </span>
                <span className="detalle-badge">
                  <AppIcon name="userGroup" /> {room.capacity} {parseInt(room.capacity) > 1 ? 'personas' : 'persona'}
                </span>
                <span className="detalle-badge">
                  <AppIcon name="eye" /> {room.views} vistas
                </span>
              </div>

              {/* Servicios */}
              {room.services.length > 0 && (
                <div className="detalle-section">
                  <h3>Servicios incluidos</h3>
                  <div className="detalle-chips">
                    {room.services.map((s) => (
                      <span key={s} className="detalle-chip">{SERVICE_LABELS[s] || s}</span>
                    ))}
                  </div>
                </div>
              )}

              {/* Cerca de */}
              {room.cercaDe.length > 0 && (
                <div className="detalle-section">
                  <h3>Cerca de</h3>
                  <div className="detalle-chips">
                    {room.cercaDe.map((c) => (
                      <span key={c} className="detalle-chip">
                        {c === 'universidad' && room.universidadCercana
                          ? room.universidadCercana
                          : CERCA_LABELS[c] || c}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Reglas */}
              {room.reglas && (
                <div className="detalle-section">
                  <h3>Reglas de la casa</h3>
                  <p className="detalle-text">{room.reglas}</p>
                </div>
              )}

              {/* Disponibilidad */}
              <div className="detalle-section">
                <h3>Disponibilidad</h3>
                <p className="detalle-text">
                  {room.disponibilidad === 'Inmediata' ? 'Disponible ahora mismo' : `Desde ${room.disponibilidad}`}
                </p>
              </div>

              {/* Publicado por */}
              <div className="detalle-owner-card">
                <div className="detalle-owner-avatar">{room.owner.name.charAt(0).toUpperCase()}</div>
                <div>
                  <p className="detalle-owner-label">Publicado por</p>
                  <p className="detalle-owner-name">{room.owner.name}</p>
                </div>
              </div>

              {/* Botón de contacto */}
              <button className="detalle-contact-btn" onClick={() => setShowContactPanel(true)}>
                <AppIcon name="whatsapp" /> Contactar al propietario
              </button>
            </div>
          </>
        )}

        {/* Panel de contacto */}
        {showContactPanel && room && (
          <div className="contact-overlay" onClick={(e) => {
            if (e.target === e.currentTarget) setShowContactPanel(false);
          }}>
            <div className="contact-panel">
              <div className="contact-panel-header">
                <h2>Contactar a {room.owner.name}</h2>
                <button className="contact-close" onClick={() => setShowContactPanel(false)}>
                  <AppIcon name="xmark" />
                </button>
              </div>

              <div className="contact-panel-body">
                {!room.owner.phone ? (
                  <p className="contact-no-phone">
                    Este propietario todavía no cargó un número de contacto en su perfil.
                  </p>
                ) : (
                  <>
                    {whatsappLink && (
                      <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="contact-whatsapp-btn"
                      >
                        <AppIcon name="whatsapp" /> Abrir WhatsApp
                      </a>
                    )}

                    <div className="contact-qr-section">
                      <p>O escaneá el código QR</p>
                      <img src="/images/WhatsApp-qr.jpeg" alt="Código QR de WhatsApp" className="contact-qr-image" />
                    </div>

                    <div className="contact-phone-section">
                      <p>Número de contacto</p>
                      <span className="contact-phone-number">{room.owner.phone}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}