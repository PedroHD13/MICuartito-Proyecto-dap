'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

// Definir el tipo de usuario
type User = {
  username: string
  type: 'propietario' | 'inquilino'
  name: string
}

// Definir el contexto
type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => boolean
  logout: () => void
}

// Crear el contexto
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Usuarios de prueba (igual que en index.html)
const DEMO_USERS = {
  'propietario': { 
    password: 'propietario123', 
    type: 'propietario' as const, 
    name: 'Carlos Propietario' 
  },
  'inquilino': { 
    password: 'inquilino123', 
    type: 'inquilino' as const, 
    name: 'María Inquilina' 
  }
}

// Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)

  // Función de login
  const login = (username: string, password: string): boolean => {
    // Buscar el usuario en los usuarios de prueba
    const userData = DEMO_USERS[username as keyof typeof DEMO_USERS]
    
    if (userData && userData.password === password) {
      // Crear objeto de usuario
      const user = { 
        username, 
        type: userData.type, 
        name: userData.name 
      }
      // Guardar en localStorage (como en el original)
      localStorage.setItem('currentUser', JSON.stringify(user))
      setUser(user)
      return true
    }
    return false
  }

  // Función de logout
  const logout = () => {
    localStorage.removeItem('currentUser')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook para usar el contexto
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}