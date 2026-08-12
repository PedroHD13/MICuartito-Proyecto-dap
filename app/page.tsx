export default function Home() {
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
            <button className="tab active">
              Iniciar Sesión
            </button>

            <button className="tab">
              Registrarse
            </button>
          </div>

          <div className="form-container">

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

          </div>
        </div>
      </div>
    </main>
  );
}