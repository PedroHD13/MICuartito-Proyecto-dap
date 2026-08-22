"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "../../useSession";
import "../styles/layout-styles.css";
import "../styles/login-styles.css";
import AppIcon from "../components/AppIcon";

export default function LoginPage() {
  const router = useRouter();
  const { session, login, logout } = useSession();

  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Datos del registro
  const [registerData, setRegisterData] = useState({
    name: "",
    username: "",
    password: "",
    role: "inquilino",
  });

  // Datos del login
  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [registerMessage, setRegisterMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  // =========================
  // REGISTRO
  // =========================

  const handleRegisterChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setRegisterData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const users = JSON.parse(
      localStorage.getItem("micuartito-users") || "[]"
    );

    const existingUser = users.find(
      (user: { username: string }) =>
        user.username === registerData.username
    );

    if (existingUser) {
      setRegisterMessage("El usuario ya está registrado.");
      return;
    }

    const newUser = {
      id: Date.now(),
      name: registerData.name,
      username: registerData.username,
      password: registerData.password,
      role: registerData.role,
    };

    users.push(newUser);

    localStorage.setItem(
      "micuartito-users",
      JSON.stringify(users)
    );

    setRegisterMessage("¡Cuenta creada correctamente!");

    setRegisterData({
      name: "",
      username: "",
      password: "",
      role: "inquilino",
    });
  };

  // =========================
  // LOGIN (CON REDIRECCIÓN)
  // =========================

  const handleLoginChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = event.target;

    setLoginData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

    const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const users = JSON.parse(
      localStorage.getItem("micuartito-users") || "[]"
    );

    const foundUser = users.find(
      (user: { username: string; password: string }) =>
        user.username === loginData.username &&
        user.password === loginData.password
    );

    if (!foundUser) {
      setLoginMessage("Usuario o contraseña incorrectos.");
      return;
    }

    // ✅ Guardar sesión
    login({
      username: foundUser.username,
      name: foundUser.name,
      role: foundUser.role,
    });

    setLoginMessage("");
    setLoginData({ username: "", password: "" });

    // ✅ Redirigir según el rol
    const roleRoutes: Record<string, string> = {
      inquilino: "/inquilino",
      propietario: "/propietario",
      admin: "/admin",
    };

    router.push(roleRoutes[foundUser.role] || "/");
  };

  const handleLogout = () => {
    logout();
  };

  const roleMessages: Record<string, string> = {
    inquilino: "Has ingresado al perfil de Inquilino",
    propietario: "Has ingresado al perfil de Propietario",
    admin: "Has ingresado como Administrador",
  };

  // =========================
  // PANTALLA PROVISIONAL (sesión activa)
  // =========================

  if (session) {
    return (
      <main>
        <div id="session-screen">
          <div className="login-container">
            <h2>{roleMessages[session.role] || "Sesión iniciada"}</h2>
            <p>Usuario: {session.username}</p>

            <button
              className="btn btn-primary"
              onClick={handleLogout}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div id="login-screen">
        <div className="login-container">

          <div className="login-header">
            <img
              src="/images/logo encabezado.png"
              alt="Micuartito"
              className="logo"
            />
          </div>

          {/* PESTAÑAS */}
          <div className="tabs">
            <button
              className={`tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("login");
                setLoginMessage("");
              }}
            >
              Iniciar Sesión
            </button>

            <button
              className={`tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("register");
                setRegisterMessage("");
              }}
            >
              Registrarse
            </button>
          </div>

          <div className="form-container">
            {/* LOGIN */}
            {activeTab === "login" && (
              <div className="form-section active">
                <form onSubmit={handleLogin}>
                  <div className="input-group">
                    <label htmlFor="login-username">Usuario</label>
                    <input
                      type="text"
                      id="login-username"
                      name="username"
                      placeholder="Ingresa tu usuario"
                      value={loginData.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="login-password">Contraseña</label>
                    <div className="password-wrapper">
                      <input
                        type={showLoginPassword ? "text" : "password"}
                        id="login-password"
                        name="password"
                        placeholder="••••••••"
                        value={loginData.password}
                        onChange={handleLoginChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                      >
                        <AppIcon name="eye" />
                      </button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Ingresar
                  </button>

                  {loginMessage && (
                    <div className="register-msg error">
                      {loginMessage}
                    </div>
                  )}

                  <div className="demo-info">
                    <h4><AppIcon name="shield" /> Usuarios de prueba:</h4>
                    <p>
                      <strong>Propietario:</strong>{" "}
                      propietario / propietario123
                    </p>
                    <p>
                      <strong>Inquilino:</strong>{" "}
                      inquilino / inquilino123
                    </p>
                  </div>
                </form>
              </div>
            )}

            {/* REGISTRO */}
            {activeTab === "register" && (
              <div className="form-section active">
                <form onSubmit={handleRegister}>
                  <div className="input-group">
                    <label htmlFor="register-name">Nombre Completo</label>
                    <input
                      type="text"
                      id="register-name"
                      name="name"
                      placeholder="Juan Pérez"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="register-username">Usuario</label>
                    <input
                      type="text"
                      id="register-username"
                      name="username"
                      placeholder="miusuario"
                      value={registerData.username}
                      onChange={handleRegisterChange}
                      required
                      autoComplete="off"
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="register-password">Contraseña</label>
                    <div className="password-wrapper">
                      <input
                        type={showRegisterPassword ? "text" : "password"}
                        id="register-password"
                        name="password"
                        placeholder="Mínimo 6 caracteres"
                        value={registerData.password}
                        onChange={handleRegisterChange}
                        required
                      />
                      <button
                        type="button"
                        className="toggle-password"
                        onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                      >
                        <AppIcon name="eye" />
                      </button>
                    </div>
                  </div>

                  <div className="input-group">
                    <label>Tipo de cuenta</label>
                    <div className="role-selector">
                      <label className="role-option">
                        <input
                          type="radio"
                          name="role"
                          value="inquilino"
                          checked={registerData.role === "inquilino"}
                          onChange={handleRegisterChange}
                        />
                        <span><AppIcon name="magnifyingGlass" /> Busco Cuarto</span>
                      </label>
                      <label className="role-option">
                        <input
                          type="radio"
                          name="role"
                          value="propietario"
                          checked={registerData.role === "propietario"}
                          onChange={handleRegisterChange}
                        />
                        <span><AppIcon name="house" /> Alquilo Cuarto</span>
                      </label>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary">
                    Crear Cuenta
                  </button>

                  {registerMessage && (
                    <div className={`register-msg ${registerMessage.includes('correctamente') ? 'success' : 'error'}`}>
                      {registerMessage}
                    </div>
                  )}
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}