"use client";

import { useState } from "react";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerData, setRegisterData] = useState({
  name: "",
  username: "",
  email: "",
  password: "",
  role: "inquilino",
  });

  const handleRegisterChange = (
  event: React.ChangeEvent<HTMLInputElement>
) => {
  const { name, value } = event.target;

  setRegisterData((prev) => ({
    ...prev,
    [name]: value,
  }));
};

  const [registerMessage, setRegisterMessage] = useState("");

  const handleRegister = (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  const users = JSON.parse(
    localStorage.getItem("micuartito-users") || "[]"
  );

  const existingUser = users.find(
    (user: { username: string; email: string }) =>
      user.username === registerData.username ||
      user.email === registerData.email
  );

  if (existingUser) {
    setRegisterMessage(
      "El usuario o correo electrónico ya está registrado."
    );
    return;
  }

  const newUser = {
    id: Date.now(),
    name: registerData.name,
    username: registerData.username,
    email: registerData.email,
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
    email: "",
    password: "",
    role: "inquilino",
  });
};

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

          <div className="tabs">
            <button
              className={`tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              Iniciar Sesión
            </button>

            <button
              className={`tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => setActiveTab("register")}
            >
              Registrarse
            </button>
          </div>

          <div className="form-container">

            {activeTab === "login" && (
              <div className="form-section active">
                <form>
                  <div className="input-group">
                    <label htmlFor="login-email">
                      Usuario
                    </label>

                    <input
                      type="text"
                      id="login-email"
                      placeholder="Ingresa tu usuario"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <label htmlFor="login-password">
                      Contraseña
                    </label>

                    <input
                      type="password"
                      id="login-password"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary"
                  >
                    Ingresar
                  </button>

                  <div className="demo-info">
                    <h4>🔐 Usuarios de prueba:</h4>

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

            {activeTab === "register" && (
          <div className="form-section active">
            <form onSubmit={handleRegister}>
              <div className="input-group">
                <label htmlFor="register-name">
                  Nombre Completo
                </label>

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
            <label htmlFor="register-username">
              Usuario
            </label>

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
            <label htmlFor="register-email">
              Correo Electrónico
            </label>

            <input
            type="email"
            id="register-email"
            name="email"
            placeholder="tu@email.com"
            value={registerData.email}
            onChange={handleRegisterChange}
            required
            />
          </div>

      <div className="input-group">
        <label htmlFor="register-password">
          Contraseña
        </label>

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
          title="Mostrar/ocultar contraseña"
        >
          👁
        </button>
        </div>
      </div>

      <div className="input-group">
        <label>
          Tipo de cuenta
        </label>

        <div className="role-selector">
          <label className="role-option">
            <input
                type="radio"
                name="role"
                value="inquilino"
                checked={registerData.role === "inquilino"}
                onChange={handleRegisterChange}
            />
            <span>🔍 Busco Cuarto</span>
            </label>

          <label className="role-option">
        <input
            type="radio"
            name="role"
            value="propietario"
            checked={registerData.role === "propietario"}
            onChange={handleRegisterChange}
        />
        <span>🏠 Alquilo Cuarto</span>
        </label>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary"
      >
        Crear Cuenta
      </button>

      {registerMessage && (
        <div className="register-msg">
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