'use client';

import { useRouter } from 'next/navigation';
import { useSession } from '../useSession';
import { useEffect, useState } from 'react';
import './styles/home-styles.css';

// 👇 PONÉ ACÁ TUS IMÁGENES. Colocá los archivos en /public/images/hero/
// y solo cambiá los nombres/cantidad de esta lista.
const heroImages = [
  '/images/hero/imagen1.jpg',
  '/images/hero/imagen2.jpg',
  '/images/hero/imagen3.jpg',
];

export default function HomePage() {
  const router = useRouter();
  const { session, loading } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    if (!loading && session) {
      router.replace('/dashboard');
    }
  }, [session, loading, router]);

  // Autoplay del carrusel
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
      {/* IZQUIERDA: mensaje + CTA */}
      <div className="home-left">
        <img src="/images/logo encabezado.png" alt="MiCuartito" className="home-logo" />

        <h1 className="home-title">MiCuartito</h1>
        <p className="home-slogan">
          Encuentra el cuarto ideal o publica el tuyo en minutos.
          Fácil, rápido y pensado para estudiantes.
        </p>

        <button className="home-cta" onClick={() => router.push('/login')}>
          Comenzar →
        </button>

      </div>

      {/* DERECHA: carrusel de imágenes */}
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