'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import DashboardShell from '../../components/DashboardShell';
import '../../styles/dashboard-styles.css';
import '../../styles/perfil-styles.css';
import AppIcon from '../../components/AppIcon';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  bio: string;
  avatar: string;
}

interface NotificationPrefs {
  newInterested: boolean;
  messages: boolean;
  promos: boolean;
}

const PROFILE_DEFAULTS: Omit<ProfileData, 'name' | 'avatar'> = {
  email: 'correo@ejemplo.com',
  phone: '+591 71234567',
  birthdate: '1990-01-01',
  bio: 'Propietario con experiencia en alquiler de cuartos. Busco inquilinos responsables y respetuosos.',
};

const NOTIF_DEFAULTS: NotificationPrefs = {
  newInterested: true,
  messages: true,
  promos: false,
};

const AVATAR_OPTIONS = ['P', 'C', 'D', 'H', 'M', 'U', 'C'];

export default function PerfilPropietario() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('propietario');

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] = useState<ProfileData | null>(null);
  const [notifPrefs, setNotifPrefs] = useState<NotificationPrefs>(NOTIF_DEFAULTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [myRoomsCount, setMyRoomsCount] = useState(0);

  const profileKey = session ? `profileData_${session.username}` : '';
  const notifKey = session ? `notifPrefs_${session.username}` : '';

  useEffect(() => {
    if (!session) return;

    const savedProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');

    const loaded: ProfileData = {
      name: savedProfile.name || session.name,
      email: savedProfile.email || PROFILE_DEFAULTS.email,
      phone: savedProfile.phone || PROFILE_DEFAULTS.phone,
      birthdate: savedProfile.birthdate || PROFILE_DEFAULTS.birthdate,
      bio: savedProfile.bio || PROFILE_DEFAULTS.bio,
      avatar: savedProfile.avatar || session.name.charAt(0).toUpperCase(),
    };

    setProfileData(loaded);
    setOriginalProfileData(loaded);

    const savedNotifs = JSON.parse(localStorage.getItem(notifKey) || '{}');
    setNotifPrefs({ ...NOTIF_DEFAULTS, ...savedNotifs });

    const storedRooms = JSON.parse(localStorage.getItem('cuartos') || '[]');
    setMyRoomsCount(storedRooms.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading || !session || !profileData) {
    return null;
  }

  const handleFieldChange = (field: keyof ProfileData, value: string) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      cancelEdit();
    } else {
      setIsEditMode(true);
      // Agregar clase al body para modo edición
      document.body.classList.add('edit-mode');
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    document.body.classList.remove('edit-mode');
    if (originalProfileData) {
      setProfileData(originalProfileData);
    }
  };

  const saveProfile = () => {
    if (!profileData) return;

    if (!profileData.name || !profileData.email) {
      alert('El nombre y el correo son obligatorios');
      return;
    }

    localStorage.setItem(profileKey, JSON.stringify(profileData));
    setOriginalProfileData(profileData);
    setIsEditMode(false);
    document.body.classList.remove('edit-mode');

    alert('Perfil actualizado exitosamente');
  };

  const changeAvatar = () => {
    const randomAvatar = AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

    setProfileData((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, avatar: randomAvatar };
      localStorage.setItem(profileKey, JSON.stringify(updated));
      return updated;
    });
    setOriginalProfileData((prev) =>
      prev ? { ...prev, avatar: randomAvatar } : prev
    );
  };

  const toggleNotif = (field: keyof NotificationPrefs) => {
    setNotifPrefs((prev) => {
      const updated = { ...prev, [field]: !prev[field] };
      localStorage.setItem(notifKey, JSON.stringify(updated));
      return updated;
    });
  };

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  const navigateTo = (path: string) => {
    if (isEditMode) {
      if (confirm('¿Salir sin guardar los cambios?')) {
        document.body.classList.remove('edit-mode');
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  return (
    <DashboardShell role="propietario" userName={session.name} onLogout={handleLogout}>
      <div className="page-content perfil-page">
        <div className="page-header page-header-with-action">
          <div>
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información</p>
          </div>
          <button className="edit-btn-header" onClick={toggleEditMode}>
            <AppIcon name={isEditMode ? 'xmark' : 'pencil'} />
          </button>
        </div>

        {/* Profile Header Card */}
        <div className="profile-header-card">
          <div className="profile-avatar-container">
            <div className="profile-avatar">{profileData.avatar}</div>
            <button className="change-avatar-btn" onClick={changeAvatar}>
              <AppIcon name="camera" />
            </button>
          </div>
          <h2 className="profile-name">{profileData.name}</h2>
          <div className="profile-type-badge propietario"><AppIcon name="house" /> Propietario</div>
          <div className="profile-stats">
            <div className="stat-item">
              <div className="stat-value">{myRoomsCount}</div>
              <div className="stat-label">Cuartos</div>
            </div>
            <div className="stat-item">
              <div className="stat-value"><AppIcon name="star" /> 4.5</div>
              <div className="stat-label">Calificación</div>
            </div>
            <div className="stat-item">
              <div className="stat-value">{new Date().getFullYear()}</div>
              <div className="stat-label">Desde</div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <button 
            className="action-card primary" 
            onClick={() => navigateTo('/propietario/mis-cuartos')}
          >
            <span className="action-icon"><AppIcon name="building" /></span>
            <div className="action-info">
              <h3>Mis Cuartos</h3>
              <p>{myRoomsCount} publicados</p>
            </div>
          </button>

          <button 
            className="action-card" 
            onClick={() => navigateTo('/propietario/publicar')}
          >
            <span className="action-icon"><AppIcon name="plus" /></span>
            <div className="action-info">
              <h3>Publicar</h3>
              <p>Nuevo cuarto</p>
            </div>
          </button>

          <button 
            className="action-card" 
            onClick={() => navigateTo('/dashboard')}
          >
            <span className="action-icon"><AppIcon name="listCheck" /></span>
            <div className="action-info">
              <h3>Dashboard</h3>
              <p>Ver estadísticas</p>
            </div>
          </button>
        </div>

        <div className="profile-content">
          {/* Información Personal */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="user" /> Información Personal</h3>
          </div>
          <div className="info-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              className="info-input"
              value={profileData.name}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              className="info-input"
              value={profileData.email}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange('email', e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Teléfono / WhatsApp</label>
            <input
              type="tel"
              className="info-input"
              value={profileData.phone}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange('phone', e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              className="info-input"
              value={profileData.birthdate}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange('birthdate', e.target.value)}
            />
          </div>
          </div>

          {/* Sobre Mí */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="fileLines" /> Sobre Mí</h3>
          </div>
          <div className="info-group">
            <label>Descripción</label>
            <textarea
              className="info-textarea"
              rows={4}
              value={profileData.bio}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange('bio', e.target.value)}
            />
          </div>
          </div>

          {/* Calificaciones y Reseñas */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="star" /> Calificaciones y Reseñas</h3>
            <span className="reviews-count">(0 reseñas)</span>
          </div>
          <div className="rating-summary">
            <div className="rating-stars"><AppIcon name="star" /><AppIcon name="star" /><AppIcon name="star" /><AppIcon name="star" /><AppIcon name="star" /></div>
            <div className="rating-text">Aún no tienes reseñas</div>
            <p className="rating-description">
              Las reseñas de tus inquilinos aparecerán aquí
            </p>
          </div>
          </div>

          {/* Notificaciones */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="bell" /> Notificaciones</h3>
          </div>
          <div className="toggle-list">
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-title">Nuevos interesados</div>
                <div className="toggle-description">
                  Recibir notificación cuando alguien contacte
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifPrefs.newInterested}
                  onChange={() => toggleNotif('newInterested')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-title">Mensajes</div>
                <div className="toggle-description">
                  Notificaciones de mensajes nuevos
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifPrefs.messages}
                  onChange={() => toggleNotif('messages')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-title">Promociones</div>
                <div className="toggle-description">
                  Ofertas y novedades de Micuartito
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifPrefs.promos}
                  onChange={() => toggleNotif('promos')}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
          </div>

          {/* Cuenta y Seguridad */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="shield" /> Cuenta y Seguridad</h3>
          </div>
          <div className="action-list">
            <button className="action-item" onClick={() => alert('Cambiar Contraseña\n\n(Próximamente)')}>
              <span className="action-icon"><AppIcon name="key" /></span>
              <span className="action-text">Cambiar Contraseña</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button className="action-item" onClick={() => alert('Configuración de Privacidad\n\n(Próximamente)')}>
              <span className="action-icon"><AppIcon name="shield" /></span>
              <span className="action-text">Privacidad</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
          </div>
          </div>

          {/* Ayuda y Soporte */}
          <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="info" /> Ayuda y Soporte</h3>
          </div>
          <div className="action-list">
            <button className="action-item" onClick={() => alert('Centro de Ayuda\n\n(Próximamente)')}>
              <span className="action-icon"><AppIcon name="bookOpen" /></span>
              <span className="action-text">Centro de Ayuda</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button className="action-item" onClick={() => router.push('/contacto-whatsapp')}>
              <span className="action-icon"><AppIcon name="envelope" /></span>
              <span className="action-text">Contactar Soporte</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button className="action-item" onClick={() => alert('Términos y Condiciones\n\n(Próximamente)')}>
              <span className="action-icon"><AppIcon name="fileLines" /></span>
              <span className="action-text">Términos y Condiciones</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
          </div>
          </div>

          <div className="profile-section">
            <button className="btn-logout" onClick={handleLogout}>
              <AppIcon name="rightFromBracket" /> Cerrar Sesión
            </button>
          </div>

        {/* Botones de Guardar/Cancelar */}
        {isEditMode && (
          <div className="save-section">
            <button className="btn-save" onClick={saveProfile}>
              <AppIcon name="check" /> Guardar Cambios
            </button>
            <button className="btn-cancel" onClick={cancelEdit}>
              <AppIcon name="xmark" /> Cancelar
            </button>
          </div>
        )}
        </div>
      </div>
    </DashboardShell>
  );
}