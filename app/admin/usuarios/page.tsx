'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import EditUserModal, { StoredUser } from '../../components/EditUserModal';
import '../../styles/admin-usuarios-styles.css';

type RoleFilter = 'todos' | 'inquilino' | 'propietario' | 'admin';

export default function AdminUsuariosPage() {
  const router = useRouter();
  const { session, loading } = useRequireAuth('admin');

  const [users, setUsers] = useState<StoredUser[]>([]);
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('todos');
  const [editingUser, setEditingUser] = useState<StoredUser | null>(null);

  const loadUsers = () => {
    try {
      const stored: StoredUser[] = JSON.parse(localStorage.getItem('micuartito-users') || '[]');
      setUsers(stored);
    } catch (error) {
      console.error('Error cargando usuarios:', error);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  if (loading || !session) {
    return null;
  }

  const filteredUsers = roleFilter === 'todos'
    ? users
    : users.filter(u => u.role === roleFilter);

  const handleDelete = (userToDelete: StoredUser) => {
    const confirmed = window.confirm(
      `¿Seguro que querés eliminar a "${userToDelete.name}" (${userToDelete.username})? Esta acción no se puede deshacer.`
    );
    if (!confirmed) return;

    const updated = users.filter(u => u.id !== userToDelete.id);
    setUsers(updated);
    localStorage.setItem('micuartito-users', JSON.stringify(updated));
  };

  const handleSaveEdit = (updatedUser: StoredUser) => {
    const updated = users.map(u => (u.id === updatedUser.id ? updatedUser : u));
    setUsers(updated);
    localStorage.setItem('micuartito-users', JSON.stringify(updated));
    setEditingUser(null);
  };

  const roleLabel = (role: string) => {
    if (role === 'inquilino') return 'Inquilino';
    if (role === 'propietario') return 'Propietario';
    return 'Admin';
  };

  return (
    <div className="admin-usuarios-container">
      {/* Header */}
      <div className="admin-usuarios-header">
        <button className="admin-usuarios-back-btn" onClick={() => router.push('/admin')}>
          ←
        </button>
        <div>
          <h1>Gestión de Usuarios</h1>
          <p>{users.length} usuario(s) registrado(s)</p>
        </div>
      </div>

      {/* Filtro por rol */}
      <div className="admin-usuarios-filters">
        {(['todos', 'inquilino', 'propietario', 'admin'] as RoleFilter[]).map((r) => (
          <button
            key={r}
            className={`admin-role-filter-btn ${roleFilter === r ? 'active' : ''}`}
            onClick={() => setRoleFilter(r)}
          >
            {r === 'todos' ? 'Todos' : roleLabel(r)}
          </button>
        ))}
      </div>

      {/* Tabla */}
      <div className="admin-users-table-wrapper">
        {filteredUsers.length === 0 ? (
          <div className="admin-users-empty">No hay usuarios en esta categoría.</div>
        ) : (
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.username}</td>
                  <td>
                    <span className={`admin-role-badge ${u.role}`}>{roleLabel(u.role)}</span>
                  </td>
                  <td>
                    <div className="admin-users-actions">
                      <button className="admin-btn-edit" onClick={() => setEditingUser(u)}>
                        Editar
                      </button>
                      <button className="admin-btn-delete" onClick={() => handleDelete(u)}>
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EditUserModal
        user={editingUser}
        onClose={() => setEditingUser(null)}
        onSave={handleSaveEdit}
      />
    </div>
  );
}