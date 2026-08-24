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

      const handleRegister = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: registerData.name,
            username: registerData.username,
            password: registerData.password,
            role: registerData.role,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setRegisterMessage(data.error || "No se pudo crear la cuenta.");
          return;
        }

        setRegisterMessage("¡Cuenta creada correctamente!");

        setRegisterData({
          name: "",
          username: "",
          password: "",
          role: "inquilino",
        });
      } catch (error) {
        console.error(error);
        setRegisterMessage("Error de conexión con el servidor.");
      }
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

    const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: loginData.username,
            password: loginData.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setLoginMessage(data.error || "Usuario o contraseña incorrectos.");
          return;
        }

        // ✅ Guardar sesión (igual que antes)
        login({
          username: data.user.username,
          name: data.user.name,
          role: data.user.role,
        });

        setLoginMessage("");
        setLoginData({ username: "", password: "" });

        // ✅ Redirigir según el rol
        const roleRoutes: Record<string, string> = {
          inquilino: "/inquilino",
          propietario: "/propietario",
          admin: "/admin",
        };

        router.push(roleRoutes[data.user.role] || "/");
      } catch (error) {
        console.error(error);
        setLoginMessage("Error de conexión con el servidor.");
      }
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