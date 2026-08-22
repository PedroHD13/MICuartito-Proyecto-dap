"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useRequireAuth } from "../../../useSession";
import DashboardShell from "../../components/DashboardShell";
import "../../styles/perfil-styles.css";
import AppIcon from "../../components/AppIcon";

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  birthdate: string;
  bio: string;
  occupation: string;
  budget: number;
  avatar: string;
  zones: string[];
}

interface NotificationPrefs {
  newRooms: boolean;
  priceDrops: boolean;
  promos: boolean;
}

const PROFILE_DEFAULTS: Omit<ProfileData, "name" | "avatar"> = {
  email: "correo@ejemplo.com",
  phone: "+591 71234567",
  birthdate: "1995-06-15",
  bio: "Estudiante universitario, responsable y ordenado. Busco un cuarto tranquilo cerca de la universidad.",
  occupation: "Estudiante",
  budget: 800,
  zones: ["norte"],
};

const NOTIF_DEFAULTS: NotificationPrefs = {
  newRooms: true,
  priceDrops: true,
  promos: false,
};

const AVATAR_OPTIONS = ["M", "A", "U", "E", "P", "I", "O"];

const ZONE_OPTIONS = [
  { value: "norte", label: "Zona Norte" },
  { value: "centro", label: "Centro" },
  { value: "este", label: "Zona Este" },
  { value: "oeste", label: "Zona Oeste" },
  { value: "sur", label: "Zona Sur" },
];

export default function PerfilInquilino() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth("inquilino");

  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [originalProfileData, setOriginalProfileData] =
    useState<ProfileData | null>(null);
  const [notifPrefs, setNotifPrefs] =
    useState<NotificationPrefs>(NOTIF_DEFAULTS);
  const [isEditMode, setIsEditMode] = useState(false);
  const [favoritesCount, setFavoritesCount] = useState(0);

  const profileKey = session ? `profileData_${session.username}` : "";
  const notifKey = session ? `notifPrefs_${session.username}` : "";

  // Cargar perfil una vez que tenemos sesión
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
      occupation: savedProfile.occupation || PROFILE_DEFAULTS.occupation,
      budget: savedProfile.budget || PROFILE_DEFAULTS.budget,
      avatar: savedProfile.avatar || session.name.charAt(0).toUpperCase(),
      zones: savedProfile.zones || PROFILE_DEFAULTS.zones,
    };

    setProfileData(loaded);
    setOriginalProfileData(loaded);

    const savedNotifs = JSON.parse(localStorage.getItem(notifKey) || "{}");
    setNotifPrefs({ ...NOTIF_DEFAULTS, ...savedNotifs });

    const favoriteRooms = JSON.parse(
      localStorage.getItem("favoriteRooms") || "[]"
    );
    setFavoritesCount(favoriteRooms.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session]);

  // Mientras se resuelve la sesión (o si redirige a /login), no mostramos nada
  if (loading || !session || !profileData) {
    return null;
  }

  const handleFieldChange = (
    field: keyof Omit<ProfileData, "zones">,
    value: string | number
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

    alert("Perfil actualizado exitosamente");
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

  const year = new Date().getFullYear();

  return (
    <DashboardShell role="inquilino" userName={session.name} onLogout={confirmLogout}>
      <div className="page-content perfil-page">
        <div className="page-header page-header-with-action">
          <div>
            <h1>Mi Perfil</h1>
            <p>Gestiona tu información</p>
          </div>
          <button className="edit-btn-header" onClick={toggleEditMode}>
            <AppIcon name={isEditMode ? "xmark" : "pencil"} />
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
        <div className="profile-type-badge inquilino"><AppIcon name="magnifyingGlass" /> Inquilino</div>
        <div className="profile-stats">
          <div className="stat-item">
            <div className="stat-value">{favoritesCount}</div>
            <div className="stat-label">Favoritos</div>
          </div>
          <div className="stat-item">
            <div className="stat-value"><AppIcon name="star" /> 4.8</div>
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
            <h3><AppIcon name="user" /> Información Personal</h3>
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
            <h3><AppIcon name="fileLines" /> Sobre Mí</h3>
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
          <div className="info-group">
            <label>Ocupación</label>
            <input
              type="text"
              className="info-input"
              value={profileData.occupation}
              disabled={!isEditMode}
              onChange={(e) =>
                handleFieldChange("occupation", e.target.value)
              }
            />
          </div>
        </div>

        {/* Preferencias de Búsqueda */}
        <div className="profile-section">
          <div className="section-header">
            <h3>🎯 Preferencias de Búsqueda</h3>
          </div>
          <div className="info-group">
            <label>Presupuesto Máximo (Bs.)</label>
            <input
              type="number"
              className="info-input"
              value={profileData.budget}
              disabled={!isEditMode}
              onChange={(e) =>
                handleFieldChange("budget", Number(e.target.value))
              }
            />
          </div>
          <div className="info-group">
            <label>Zonas Preferidas</label>
            <select
              className="info-input"
              multiple
              disabled={!isEditMode}
              value={profileData.zones}
              onChange={(e) => {
                const selected = Array.from(
                  e.target.selectedOptions,
                  (opt) => opt.value
                );
                setProfileData((prev) =>
                  prev ? { ...prev, zones: selected } : prev
                );
              }}
            >
              {ZONE_OPTIONS.map((zone) => (
                <option key={zone.value} value={zone.value}>
                  {zone.label}
                </option>
              ))}
            </select>
          </div>
          <div className="info-group">
            <label>Servicios Requeridos</label>
            <div className="chips-container">
              <span className="chip"><AppIcon name="wifi" /> WiFi</span>
              <span className="chip"><AppIcon name="droplet" /> Agua</span>
              <span className="chip"><AppIcon name="lightbulb" /> Luz</span>
              <span className="chip"><AppIcon name="couch" /> Amoblado</span>
            </div>
          </div>
        </div>

        {/* Verificación */}
        <div className="profile-section">
          <div className="section-header">
            <h3><AppIcon name="check" /> Verificación</h3>
          </div>
          <div className="verification-list">
            <div className="verification-item verified">
              <span className="verification-icon"><AppIcon name="check" /></span>
              <span className="verification-text">Correo verificado</span>
            </div>
            <div className="verification-item verified">
              <span className="verification-icon"><AppIcon name="check" /></span>
              <span className="verification-text">Teléfono verificado</span>
            </div>
            <div className="verification-item">
              <span className="verification-icon">○</span>
              <span className="verification-text">Identidad verificada</span>
              <button
                className="verify-btn"
                onClick={() =>
                  alert("Verificación de identidad — Próximamente")
                }
              >
                Verificar
              </button>
            </div>
            <div className="verification-item">
              <span className="verification-icon">○</span>
              <span className="verification-text">
                Estudiante verificado
              </span>
              <button
                className="verify-btn"
                onClick={() =>
                  alert("Verificación de estudiante — Próximamente")
                }
              >
                Verificar
              </button>
            </div>
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
              Las reseñas de propietarios aparecerán aquí
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
                <div className="toggle-title">Nuevos cuartos</div>
                <div className="toggle-description">
                  Cuartos que coinciden con tus preferencias
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifPrefs.newRooms}
                  onChange={() => toggleNotif("newRooms")}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="toggle-item">
              <div className="toggle-info">
                <div className="toggle-title">Cambios de precio</div>
                <div className="toggle-description">
                  Cuando baja el precio de tus favoritos
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notifPrefs.priceDrops}
                  onChange={() => toggleNotif("priceDrops")}
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
            <h3><AppIcon name="shield" /> Cuenta y Seguridad</h3>
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
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button
              className="action-item"
              onClick={() =>
                alert("Configuración de Privacidad\n\n(Próximamente)")
              }
            >
              <span className="action-icon"><AppIcon name="shield" /></span>
              <span className="action-text">Privacidad</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
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
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button
              className="action-item"
              onClick={() => router.push("/contacto-whatsapp")}
            >
              <span className="action-icon"><AppIcon name="envelope" /></span>
              <span className="action-text">Contactar Soporte</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
            <button
              className="action-item"
              onClick={() =>
                alert("📄 Términos y Condiciones\n\n(Próximamente)")
              }
            >
              <span className="action-icon">📄</span>
              <span className="action-text">Términos y Condiciones</span>
              <span className="action-arrow"><AppIcon name="chevronRight" /></span>
            </button>
          </div>
        </div>

        {/* Cerrar Sesión */}
        <div className="profile-section">
          <button className="btn-logout" onClick={confirmLogout}>
            <AppIcon name="rightFromBracket" /> Cerrar Sesión
          </button>
        </div>

        {/* Botón Guardar (solo visible en modo edición) */}
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
