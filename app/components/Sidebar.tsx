'use client';

import { usePathname, useRouter } from 'next/navigation';

export type DashboardRole = 'propietario' | 'inquilino';

export interface NavItem {
  icon: string;
  label: string;
  path: string;
}

// 👉 Si más adelante agregas pantallas nuevas (ej. mensajes, notificaciones),
// solo agrega la entrada acá y aparece automáticamente en el sidebar Y en la
// barra inferior móvil (ambos leen esta misma lista).
export const NAV_ITEMS: Record<DashboardRole, NavItem[]> = {
  propietario: [
    { icon: '🏠', label: 'Inicio', path: '/propietario' },
    { icon: '➕', label: 'Publicar', path: '/propietario/publicar' },
    { icon: '🏘️', label: 'Mis Cuartos', path: '/propietario/mis-cuartos' },
    { icon: '👤', label: 'Perfil', path: '/propietario/perfil' },
  ],
  inquilino: [
    { icon: '🏠', label: 'Inicio', path: '/inquilino' },
    { icon: '🔍', label: 'Buscar', path: '/inquilino/buscar' },
    { icon: '❤️', label: 'Favoritos', path: '/inquilino/favoritos' },
    { icon: '👤', label: 'Perfil', path: '/inquilino/perfil' },
  ],
};

const ROLE_LABEL: Record<DashboardRole, string> = {
  propietario: '🏠 Propietario',
  inquilino: '🔍 Inquilino',
};

interface SidebarProps {
  role: DashboardRole;
  userName: string;
  onLogout: () => void;
}

export default function Sidebar({ role, userName, onLogout }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV_ITEMS[role];

  return (
    <aside className="app-sidebar">
      <div className="sidebar-brand" onClick={() => router.push(`/${role}`)}>
        <img src="/images/logo encabezado.png" alt="MiCuartito" className="sidebar-logo" />
        <span className="sidebar-brand-name">MiCuartito</span>
      </div>

      <nav className="sidebar-nav">
        {items.map((item) => {
          const active = pathname === item.path;
          return (
            <button
              key={item.path}
              className={`sidebar-nav-item${active ? ' active' : ''}`}
              onClick={() => router.push(item.path)}
            >
              <span className="sidebar-nav-icon">{item.icon}</span>
              <span className="sidebar-nav-label">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="sidebar-avatar">{userName.charAt(0).toUpperCase()}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-username">{userName}</span>
            <span className="sidebar-role">{ROLE_LABEL[role]}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={onLogout} title="Cerrar sesión">
          🚪
        </button>
      </div>
    </aside>
  );
}
