'use client'

import { useState } from 'react'

// Definir tipos
type User = {
  username: string
  type: 'propietario' | 'inquilino'
  name: string
}

// Usuarios de prueba
const DEMO_USERS: Record<string, { password: string; type: 'propietario' | 'inquilino'; name: string }> = {
  'propietario': {
    password: 'propietario123',
    type: 'propietario',
    name: 'Carlos Propietario'
  },
  'inquilino': {
    password: 'inquilino123',
    type: 'inquilino',
    name: 'María Inquilina'
  }
}

export default function Home() {
  // Estados
  const [tab, setTab] = useState<'login' | 'register'>('login')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [registerName, setRegisterName] = useState('')
  const [registerEmail, setRegisterEmail] = useState('')
  const [registerPassword, setRegisterPassword] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)

  // Manejar login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    const userData = DEMO_USERS[loginUsername]

    if (userData && userData.password === loginPassword) {
      const loggedUser: User = {
        username: loginUsername,
        type: userData.type,
        name: userData.name
      }
      setUser(loggedUser)
      setIsLoggedIn(true)
      // Guardar en localStorage
      localStorage.setItem('currentUser', JSON.stringify(loggedUser))
    } else {
      alert('❌ Usuario o contraseña incorrectos.\n\nPrueba con:\n• propietario / propietario123\n• inquilino / inquilino123')
    }
  }

  // Manejar registro (demo)
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault()
    alert('ℹ️ El registro está deshabilitado en la versión demo.\n\nUsa los usuarios de prueba para iniciar sesión.')
  }

  // Si está logueado, mostramos un mensaje (después haremos el dashboard)
  if (isLoggedIn && user) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h1>✅ Bienvenido, {user.name}</h1>
        <p>Tipo: {user.type === 'propietario' ? '🏠 Propietario' : '🔍 Inquilino'}</p>
        <button 
          onClick={() => {
            localStorage.removeItem('currentUser')
            setIsLoggedIn(false)
            setUser(null)
          }}
          style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
        >
          Cerrar Sesión
        </button>
      </div>
    )
  }

  // Mostrar login
  return (
    <div className="login-screen">
      <div className="login-container">
        <div className="login-header">
          <div className="logo-placeholder">
            <span>🏠</span>
            <h1>Micuartito</h1>
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${tab === 'login' ? 'active' : ''}`}
            onClick={() => setTab('login')}
          >
            Iniciar Sesión
          </button>
          <button
            className={`tab ${tab === 'register' ? 'active' : ''}`}
            onClick={() => setTab('register')}
          >
            Registrarse
          </button>
        </div>

        <div className="form-container">
          {/* Formulario Login */}
          {tab === 'login' && (
            <form onSubmit={handleLogin}>
              <div className="input-group">
                <label htmlFor="login-username">Usuario</label>
                <input
                  type="text"
                  id="login-username"
                  placeholder="Ingresa tu usuario"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="login-password">Contraseña</label>
                <input
                  type="password"
                  id="login-password"
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Ingresar
              </button>

              <div className="demo-info">
                <h4>🔐 Usuarios de prueba:</h4>
                <p><strong>Propietario:</strong> propietario / propietario123</p>
                <p><strong>Inquilino:</strong> inquilino / inquilino123</p>
              </div>
            </form>
          )}

          {/* Formulario Registro */}
          {tab === 'register' && (
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label htmlFor="register-name">Nombre Completo</label>
                <input
                  type="text"
                  id="register-name"
                  placeholder="Juan Pérez"
                  value={registerName}
                  onChange={(e) => setRegisterName(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="register-email">Correo Electrónico</label>
                <input
                  type="email"
                  id="register-email"
                  placeholder="tu@email.com"
                  value={registerEmail}
                  onChange={(e) => setRegisterEmail(e.target.value)}
                  required
                />
              </div>

              <div className="input-group">
                <label htmlFor="register-password">Contraseña</label>
                <input
                  type="password"
                  id="register-password"
                  placeholder="Mínimo 6 caracteres"
                  value={registerPassword}
                  onChange={(e) => setRegisterPassword(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                Crear Cuenta
              </button>

              <div className="demo-info">
                <h4>ℹ️ Versión Demo</h4>
                <p>El registro está deshabilitado en esta versión demo.</p>
                <p>Usa los usuarios de prueba para iniciar sesión.</p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}