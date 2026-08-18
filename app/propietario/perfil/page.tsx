"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../useSession";
import "../../styles/layout-styles.css";
import "../../styles/perfil-styles.css";

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

const PROFILE_DEFAULTS: Omit<ProfileData, "name" | "avatar"> = {
  email: "correo@ejemplo.com",
  phone: "+591 71234567",
  birthdate: "1990-01-01",
  bio: "Propietario con experiencia en alquiler de cuartos. Busco inquilinos responsables y respetuosos.",
};

const NOTIF_DEFAULTS: NotificationPrefs = {
  newInterested: true,
  messages: true,
  promos: false,
};

const AVATAR_OPTIONS = ["P", "C", "🧑‍💼", "👨", "👩‍💼", "👤", "🏠"];

export default function PerfilPropietario() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth("propietario");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] =
    useState<ProfileData | null>(null);
  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPrefs>(NOTIF_DEFAULTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [myRoomsCount, setMyRoomsCount] = useState(0);

  const profileKey = session ? `profileData_${session.username}` : "";
  const notifKey = session ? `notifPrefs_${session.username}` : "";

  useEffect(() => {
    if (!session) return;

    const savedProfile = JSON.parse(
      localStorage.getItem(profileKey) || "{}"
    );

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

    const savedNotifs = JSON.parse(localStorage.getItem(notifKey) || "{}");
    setNotifPrefs({ ...NOTIF_DEFAULTS, ...savedNotifs });

    const storedRooms = JSON.parse(localStorage.getItem("cuartos") || "[]");
    setMyRoomsCount(storedRooms.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  if (loading || !session || !profileData) {
    return null;
  }

  const handleFieldChange = (
    field: keyof ProfileData,
    value: string
  ) => {
    setProfileData((prev) => (prev ? { ...prev, [field]: value } : prev));
  };

  const toggleEditMode = () => {
    if (isEditMode) {
      cancelEdit();
    } else {
      setIsEditMode(true);
    }
  };

  const cancelEdit = () => {
    setIsEditMode(false);
    if (originalProfileData) {
      setProfileData(originalProfileData);
    }
  };

  const saveProfile = () => {
    if (!profileData) return;

    if (!profileData.name || !profileData.email) {
      alert("⚠️ El nombre y el correo son obligatorios");
      return;
    }

    localStorage.setItem(profileKey, JSON.stringify(profileData));
    setOriginalProfileData(profileData);
    setIsEditMode(false);

    alert("✅ Perfil actualizado exitosamente");
  };

  const changeAvatar = () => {
    const randomAvatar =
      AVATAR_OPTIONS[Math.floor(Math.random() * AVATAR_OPTIONS.length)];

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

  const confirmLogout = () => {
    if (confirm("¿Estás seguro que deseas cerrar sesión?")) {
      logout();
      router.push("/login");
    }
  };

  const navigateWithGuard = (path: string) => {
    if (isEditMode) {
      if (confirm("¿Salir sin guardar los cambios?")) {
        router.push(path);
      }
    } else {
      router.push(path);
    }
  };

  const goBack = () => navigateWithGuard("/propietario");
  const goToHome = () => navigateWithGuard("/propietario");
  const goToPublish = () => navigateWithGuard("/propietario/publicar");
  const goToMyRooms = () => navigateWithGuard("/propietario/mis-cuartos");

  const year = new Date().getFullYear();

  return (
    <>
      {/* Header */}
      <div className="header perfil-header">
        <div className="header-top">
          <button className="back-btn" onClick={goBack}>
            ←
          </button>
          <div className="header-title">
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información</p>
          </div>
          <button className="edit-btn" onClick={toggleEditMode}>
            {isEditMode ? "✕" : "✏️"}
          </button>
        </div>
      </div>

      {/* Profile Header Card */}
      <div className="profile-header-card">
        <div className="profile-avatar-container">
          <div className="profile-avatar">{profileData.avatar}</div>
          <button className="change-avatar-btn" onClick={changeAvatar}>
            📷
          </button>
        </div>
        <h2 className="profile-name">{profileData.name}</h2>
        <div className="profile-type-badge propietario">🏠 Propietario</div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{myRoomsCount}</div>
            <div className="stat-label">Cuartos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">⭐ 4.5</div>
            <div className="stat-label">Calificación</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">{year}</div>
            <div className="stat-label">Desde</div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Información Personal */}
        <div className="profile-section">
          <div className="section-header">
            <h3>👤 Información Personal</h3>
          </div>
          <div className="info-group">
            <label>Nombre Completo</label>
            <input
              type="text"
              className="info-input"
              value={profileData.name}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange("name", e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Correo Electrónico</label>
            <input
              type="email"
              className="info-input"
              value={profileData.email}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange("email", e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Teléfono / WhatsApp</label>
            <input
              type="tel"
              className="info-input"
              value={profileData.phone}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange("phone", e.target.value)}
            />
          </div>
          <div className="info-group">
            <label>Fecha de Nacimiento</label>
            <input
              type="date"
              className="info-input"
              value={profileData.birthdate}
              disabled={!isEditMode}
              onChange={(e) =>
                handleFieldChange("birthdate", e.target.value)
              }
            />
          </div>
        </div>

        {/* Sobre Mí */}
        <div className="profile-section">
          <div className="section-header">
            <h3>📝 Sobre Mí</h3>
          </div>
          <div className="info-group">
            <label>Descripción</label>
            <textarea
              className="info-textarea"
              rows={4}
              value={profileData.bio}
              disabled={!isEditMode}
              onChange={(e) => handleFieldChange("bio", e.target.value)}
            />
          </div>
        </div>


        {/* Calificaciones y Reseñas */}
        <div className="profile-section">
          <div className="section-header">
            <h3>⭐ Calificaciones y Reseñas</h3>
            <span className="reviews-count">(0 reseñas)</span>
          </div>
          <div className="rating-summary">
            <div className="rating-stars">⭐⭐⭐⭐⭐</div>
            <div className="rating-text">Aún no tienes reseñas</div>
            <p className="rating-description">
              Las reseñas de tus inquilinos aparecerán aquí
            </p>
          </div>
        </div>

        {/* Notificaciones */}
        <div className="profile-section">
          <div className="section-header">
            <h3>🔔 Notificaciones</h3>
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
                  onChange={() => toggleNotif("newInterested")}
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
                  onChange={() => toggleNotif("messages")}
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
                  onChange={() => toggleNotif("promos")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>

        {/* Cuenta */}
        <div className="profile-section">
          <div className="section-header">
            <h3>🔐 Cuenta y Seguridad</h3>
          </div>
          <div className="action-list">
            <button
              className="action-item"
              onClick={() =>
                alert("🔑 Cambiar Contraseña\n\n(Próximamente)")
              }
            >
              <span className="action-icon">🔑</span>
              <span className="action-text">Cambiar Contraseña</span>
              <span className="action-arrow">›</span>
            </button>
            <button
              className="action-item"
              onClick={() =>
                alert("🔒 Configuración de Privacidad\n\n(Próximamente)")
              }
            >
              <span className="action-icon">🔒</span>
              <span className="action-text">Privacidad</span>
              <span className="action-arrow">›</span>
            </button>
          </div>
        </div>

        {/* Ayuda */}
        <div className="profile-section">
          <div className="section-header">
            <h3>❓ Ayuda y Soporte</h3>
          </div>
          <div className="action-list">
            <button
              className="action-item"
              onClick={() =>
                alert("📚 Centro de Ayuda\n\n(Próximamente)")
              }
            >
              <span className="action-icon">📚</span>
              <span className="action-text">Centro de Ayuda</span>
              <span className="action-arrow">›</span>
            </button>
            <button
              className="action-item"
              onClick={() => router.push("/contacto-whatsapp")}
            >
              <span className="action-icon">💬</span>
              <span className="action-text">Contactar Soporte</span>
              <span className="action-arrow">›</span>
            </button>
            <button
              className="action-item"
              onClick={() =>
                alert("📄 Términos y Condiciones\n\n(Próximamente)")
              }
            >
              <span className="action-icon">📄</span>
              <span className="action-text">Términos y Condiciones</span>
              <span className="action-arrow">›</span>
            </button>
          </div>
        </div>

        {/* Cerrar Sesión */}
        <div className="profile-section">
          <button className="btn-logout" onClick={confirmLogout}>
            🚪 Cerrar Sesión
          </button>
        </div>

        {/* Botón Guardar (solo visible en modo edición) */}
        {isEditMode && (
          <div className="save-section">
            <button className="btn-save" onClick={saveProfile}>
              ✓ Guardar Cambios
            </button>
            <button className="btn-cancel" onClick={cancelEdit}>
              ✕ Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="bottom-nav">
        <button className="nav-item" onClick={goToHome}>
          <span className="nav-icon">🏠</span>
          <span className="nav-label">Inicio</span>
        </button>
        <button className="nav-item" onClick={goToPublish}>
          <span className="nav-icon">➕</span>
          <span className="nav-label">Publicar</span>
        </button>
        <button className="nav-item" onClick={goToMyRooms}>
          <span className="nav-icon">🏘️</span>
          <span className="nav-label">Mis Cuartos</span>
        </button>
        <button className="nav-item active">
          <span className="nav-icon">👤</span>
          <span className="nav-label">Perfil</span>
        </button>
      </div>
    </>
  );
}