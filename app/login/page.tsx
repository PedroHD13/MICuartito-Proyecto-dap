'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '../../useSession';
import { useEffect, useState } from 'react';
import '../styles/home-styles.css';
import LoginForm from '../components/LoginForm';

// Mismas imágenes que el Home. Si quieres un set distinto para login,
// solo cambia esta lista.
const heroImages = [
  '/images/hero/imagen1.jpg',
  '/images/hero/imagen2.jpg',
  '/images/hero/imagen3.jpg',
];

export default function LoginPage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Si ya hay sesión activa, redirige directo a su panel
  useEffect(() => {
    if (!loading && session) {
      const roleRoutes: Record<string, string> = {
        inquilino: '/inquilino',
        propietario: '/propietario',
        admin: '/admin',
      };
      router.replace(roleRoutes[session.role] || '/');
    }
  }, [session, loading, router]);

  // Autoplay del carrusel (igual que en Home)
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="home-loading">Cargando...</div>;
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
    <div className="home-container">
      {/* IZQUIERDA: en Home va el logo + CTA, aquí va el login/registro */}
      <div className="home-left">
        <LoginForm />
      </div>

      {/* DERECHA: mismo carrusel de imágenes que el Home */}
      <div className="home-right">
        {heroImages.map((src, index) => (
          <div key={src} className={`carousel-slide ${index === currentSlide ? 'active' : ''}`}>
            <img src={src} alt={`Cuarto ${index + 1}`} />
          </div>
        ))}
        <div className="carousel-overlay" />

        {heroImages.length > 1 && (
          <div className="carousel-dots">
            {heroImages.map((_, index) => (
              <button
                key={index}
                className={`carousel-dot ${index === currentSlide ? 'active' : ''}`}
                onClick={() => setCurrentSlide(index)}
                aria-label={`Ir a imagen ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}