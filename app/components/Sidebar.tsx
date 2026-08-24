'use client';

import { usePathname, useRouter } from 'next/navigation';
import AppIcon, { AppIconName } from './AppIcon';

export type DashboardRole = 'propietario' | 'inquilino';

export interface NavItem {
  icon: AppIconName;
  label: string;
  path: string;
}

// 👉 Si más adelante agregas pantallas nuevas (ej. mensajes, notificaciones),
// solo agrega la entrada acá y aparece automáticamente en el sidebar Y en la
// barra inferior móvil (ambos leen esta misma lista).
export const NAV_ITEMS: Record<DashboardRole, NavItem[]> = {
  propietario: [
    { icon: 'house', label: 'Inicio', path: '/propietario' },
    { icon: 'plus', label: 'Publicar', path: '/propietario/publicar' },
    { icon: 'building', label: 'Mis Cuartos', path: '/propietario/mis-cuartos' },
    { icon: 'user', label: 'Perfil', path: '/propietario/perfil' },
  ],
  inquilino: [
    { icon: 'house', label: 'Inicio', path: '/inquilino' },
    { icon: 'magnifyingGlass', label: 'Buscar', path: '/inquilino/buscar' },
    { icon: 'heart', label: 'Favoritos', path: '/inquilino/favoritos' },
    { icon: 'user', label: 'Perfil', path: '/inquilino/perfil' },
  ],
};

const ROLE_LABEL: Record<DashboardRole, string> = {
  propietario: 'Propietario',
  inquilino: 'Inquilino',
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
              <span className="sidebar-nav-icon"><AppIcon name={item.icon} /></span>
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
          <AppIcon name="rightFromBracket" />
        </button>
      </div>
    </aside>
  );
}
