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