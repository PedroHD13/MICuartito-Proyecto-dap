'use client';

import { useState, useEffect } from 'react';
import AppIcon from './AppIcon';

export interface StoredUser {
  id: number;
  name: string;
  username: string;
  password: string;
  role: 'inquilino' | 'propietario' | 'admin';
}

interface EditUserModalProps {
  user: StoredUser | null;
  onClose: () => void;
  onSave: (updatedUser: StoredUser) => void;
}

export default function EditUserModal({ user, onClose, onSave }: EditUserModalProps) {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<StoredUser['role']>('inquilino');

  // Sincronizar el form cada vez que cambia el usuario a editar
  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setRole(user.role);
    }
  }, [user]);

  if (!user) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleSave = () => {
    onSave({ ...user, name, username, role });
  };

  return (
    <div className="edit-user-overlay" onClick={handleBackdropClick}>
      <div className="edit-user-panel">
        <div className="edit-user-header">
          <h2>Editar Usuario</h2>
          <button className="edit-user-close" onClick={onClose} aria-label="Cerrar"><AppIcon name="xmark" /></button>
        </div>

        <div className="edit-user-body">
          <div className="edit-user-field">
            <label htmlFor="edit-name">Nombre Completo</label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="edit-user-field">
            <label htmlFor="edit-username">Usuario</label>
            <input
              id="edit-username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="edit-user-field">
            <label htmlFor="edit-role">Rol</label>
            <select
              id="edit-role"
              value={role}
              onChange={(e) => setRole(e.target.value as StoredUser['role'])}
            >
              <option value="inquilino">Inquilino</option>
              <option value="propietario">Propietario</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="edit-user-footer">
          <button className="edit-user-btn-cancel" onClick={onClose}>
            Cancelar
          </button>
          <button className="edit-user-btn-save" onClick={handleSave}>
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}