'use client';

import Sidebar, { DashboardRole } from './Sidebar';
import BottomNav from './BottomNav';
import './app-shell.css';

interface DashboardShellProps {
  role: DashboardRole;
  userName: string;
  onLogout: () => void;
  children: React.ReactNode;
}

// 👉 Envuelve el contenido de cada pantalla post-login.
// En PC (>= 900px) muestra el sidebar fijo a la izquierda.
// En móvil muestra la barra de navegación inferior, como antes.
export default function DashboardShell({ role, userName, onLogout, children }: DashboardShellProps) {
  return (
    <div className="app-shell">
      <Sidebar role={role} userName={userName} onLogout={onLogout} />
      <main className="app-main">{children}</main>
      <BottomNav role={role} />
    </div>
  );
}
