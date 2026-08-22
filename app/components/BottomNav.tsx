'use client';

import { usePathname, useRouter } from 'next/navigation';
import { NAV_ITEMS, DashboardRole } from './Sidebar';

interface BottomNavProps {
  role: DashboardRole;
}

export default function BottomNav({ role }: BottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const items = NAV_ITEMS[role];

  return (
    <div className="app-bottom-nav">
      {items.map((item) => {
        const active = pathname === item.path;
        return (
          <button
            key={item.path}
            className={`app-nav-item${active ? ' active' : ''}`}
            onClick={() => router.push(item.path)}
          >
            <span className="app-nav-icon">{item.icon}</span>
            <span className="app-nav-label">{item.label}</span>
          </button>
        );
      })}
    </div>
  );
}
