'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useRequireAuth } from '../../../useSession';
import DashboardShell from '../../components/DashboardShell';
import '../../styles/publicar-styles.css';
import AppIcon from '../../components/AppIcon';

const ZONA_LABELS: Record<string, string> = {
  norte: 'Zona Norte',
  sur: 'Zona Sur',
  este: 'Zona Este',
  oeste: 'Zona Oeste',
  centro: 'Centro',
};

const UNIVERSIDADES = [
  { group: 'Públicas', options: ['UAGRM', 'UPSA-TEC'] },
  {
    group: 'Privadas',
    options: [
      'UPSA', 'UCEBOL', 'UCB', 'UNIPOL', 'UTEPSA',
      'UNIVALLE', 'UNIBOL', 'UNIFRANZ', 'NUR', 'UDABOL', 'UNISUR',
    ],
  },
  { group: 'Técnicas', options: ['EMI', 'INFOCAL'] },
];

export default function PublicarCuarto() {
  const router = useRouter();
  const { session, loading, logout } = useRequireAuth('propietario');

  const [titulo, setTitulo] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [tipo, setTipo] = useState<'privada' | 'compartida'>('privada');
  const [bano, setBano] = useState<'privado' | 'compartido'>('privado');
  const [capacidad, setCapacidad] = useState('');
  const [zona, setZona] = useState('');
  const [barrio, setBarrio] = useState('');
  const [servicios, setServicios] = useState<string[]>([]);
  const [cercaDe, setCercaDe] = useState<string[]>([]);
  const [universidadCercana, setUniversidadCercana] = useState('');
  const [precio, setPrecio] = useState('');
  const [reglas, setReglas] = useState('');
  const [disponibilidad, setDisponibilidad] = useState<'inmediata' | 'fecha'>('inmediata');
  const [fecha, setFecha] = useState('');

  if (loading || !session) {
    return null;
  }

  const handleLogout = () => {
    if (confirm('¿Estás seguro que deseas cerrar sesión?')) {
      logout();
      router.push('/login');
    }
  };

  const goBack = () => {
    if (confirm('¿Seguro que quieres salir? Se perderán los cambios no guardados.')) {
      router.push('/propietario');
    }
  };

  const handlePhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const maxPhotos = 6;

    if (photos.length + files.length > maxPhotos) {
      alert(`Solo puedes subir un máximo de ${maxPhotos} fotos`);
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPhotos((prev) => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });

    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleService = (list: string[], setList: (v: string[]) => void, value: string) => {
    if (list.includes(value)) {
      setList(list.filter((v) => v !== value));
    } else {
      setList([...list, value]);
    }
  };

  const toggleCercaDe = (value: string) => {
    const isSelected = cercaDe.includes(value);
    toggleService(cercaDe, setCercaDe, value);
    if (value === 'universidad' && isSelected) {
      setUniversidadCercana('');
    }
  };

    const publicarCuarto = async () => {
    if (photos.length === 0) {
      alert('Debes agregar al menos una foto del cuarto');
      return;
    }
    if (!precio || Number(precio) <= 0) {
      alert('Debes ingresar un precio válido');
      return;
    }
    if (!capacidad) {
      alert('Debes seleccionar la capacidad');
      return;
    }
    if (!zona) {
      alert('Debes seleccionar una zona');
      return;
    }
    if (cercaDe.includes('universidad') && !universidadCercana) {
      alert('Por favor selecciona la universidad cercana');
      return;
    }

    const ubicacion = barrio ? `${ZONA_LABELS[zona]}, ${barrio}` : ZONA_LABELS[zona];

    const data = {
      titulo: titulo || `Cuarto ${tipo === 'privada' ? 'Privado' : 'Compartido'}`,
      fotos: photos,
      tipo,
      bano,
      capacidad,
      servicios,
      cercaDe,
      universidadCercana: universidadCercana || null,
      precio,
      reglas,
      zona,
      barrio,
      disponibilidad: disponibilidad === 'fecha' ? fecha : 'inmediata',
      ownerUsername: session.username,
    };

    try {
      const response = await fetch('/api/cuartos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || 'No se pudo publicar el cuarto.');
        return;
      }

      alert(
        `¡Cuarto publicado exitosamente!\n\nFotos: ${photos.length}\nTipo: ${tipo}\nUbicación: ${ubicacion}\nPrecio: Bs. ${precio}`
      );

      router.push('/propietario');
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor.');
    }
  };

  return (
    <DashboardShell role="propietario" userName={session.name} onLogout={handleLogout}>
      <div className="page-content">
        {/* Encabezado */}
        <div className="page-header page-header-with-action">
          <div>
            <h1>Publicar Cuarto</h1>
            <p>Completa la información</p>
          </div>
          <button className="btn-cancel-link" onClick={goBack}><AppIcon name="arrowLeft" /> Cancelar</button>
        </div>

        <div className="form-container">
          {/* Fotografías */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="camera" /></span>
              Fotografías del Cuarto
            </div>
            <label htmlFor="photo-input" className="photo-upload-area">
              <div className="photo-upload-icon"><AppIcon name="image" /></div>
              <div className="photo-upload-text">
                <strong>Toca para agregar fotos</strong><br />
                <small>Máximo 6 fotos</small>
              </div>
            </label>
            <input
              type="file"
              id="photo-input"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={handlePhotos}
            />
            {photos.length > 0 && (
              <div className="photo-grid">
                {photos.map((photo, index) => (
                  <div className="photo-item" key={index}>
                    <img src={photo} alt={`Foto ${index + 1}`} />
                    <button className="remove-photo" onClick={() => removePhoto(index)}>
                      <AppIcon name="xmark" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Título */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="fileLines" /></span>
              Título del Anuncio
            </div>
            <div className="input-group">
              <input
                type="text"
                placeholder="Ej: Cuarto amplio cerca UAGRM"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>
          </div>

          {/* Tipo */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="doorOpen" /></span>
              Tipo de Habitación
            </div>
            <div className="options-group">
              <button
                type="button"
                className={`option-btn ${tipo === 'privada' ? 'selected' : ''}`}
                onClick={() => setTipo('privada')}
              >
                Privada
              </button>
              <button
                type="button"
                className={`option-btn ${tipo === 'compartida' ? 'selected' : ''}`}
                onClick={() => setTipo('compartida')}
              >
                Compartida
              </button>
            </div>
          </div>

          {/* Capacidad */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="userGroup" /></span>
              Capacidad
            </div>
            <div className="input-group">
              <label>Número de personas</label>
              <select value={capacidad} onChange={(e) => setCapacidad(e.target.value)} required>
                <option value="">Selecciona</option>
                <option value="1">1 persona</option>
                <option value="2">2 personas</option>
                <option value="3">3 personas</option>
                <option value="4">4 personas</option>
                <option value="5+">5 o más personas</option>
              </select>
            </div>
          </div>

          {/* Tipo de Baño */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="shower" /></span>
              Tipo de Baño
            </div>
            <div className="options-group">
              <button
                type="button"
                className={`option-btn ${bano === 'privado' ? 'selected' : ''}`}
                onClick={() => setBano('privado')}
              >
                Privado
              </button>
              <button
                type="button"
                className={`option-btn ${bano === 'compartido' ? 'selected' : ''}`}
                onClick={() => setBano('compartido')}
              >
                Compartido
              </button>
            </div>
          </div>

          {/* Ubicación */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="building" /></span>
              Ubicación
            </div>
            <div className="input-group">
              <label>Zona</label>
              <select value={zona} onChange={(e) => setZona(e.target.value)} required>
                <option value="">Selecciona una zona</option>
                <option value="norte">Zona Norte</option>
                <option value="sur">Zona Sur</option>
                <option value="este">Zona Este</option>
                <option value="oeste">Zona Oeste</option>
                <option value="centro">Centro</option>
              </select>
            </div>
            <div className="input-group">
              <label>Barrio / Referencia</label>
              <input
                type="text"
                placeholder="Ej: 3er Anillo, Av. Alemana, Equipetrol..."
                value={barrio}
                onChange={(e) => setBarrio(e.target.value)}
              />
            </div>
          </div>

          {/* Servicios */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="listCheck" /></span>
              Servicios Incluidos
            </div>
            <div className="services-grid">
              {[
                ['wifi', 'WiFi', 'wifi'],
                ['agua', 'Agua', 'droplet'],
                ['luz', 'Luz', 'lightbulb'],
                ['gas', 'Gas', 'fire'],
                ['muebles', 'Amoblado', 'couch'],
                ['cocina', 'Cocina', 'utensils'],
                ['lavanderia', 'Lavandería', 'umbrellaBeach'],
                ['parking', 'Parking', 'building'],
              ].map(([value, label, icon]) => (
                <label
                  key={value}
                  className={`service-item ${servicios.includes(value) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={servicios.includes(value)}
                    onChange={() => toggleService(servicios, setServicios, value)}
                  />
                  <span className="service-label"><AppIcon name={icon as any} /> {label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Cerca de */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="building" /></span>
              Cerca de..
            </div>
            <div className="services-grid">
              {[
                ['universidad', 'Universidad', 'building'],
                ['transporte', 'Transporte público', 'arrowRight'],
                ['mercados', 'Mercados/tiendas', 'building'],
                ['hospital', 'Hospital/centros de salud', 'kitMedical'],
                ['farmacias', 'Farmacias', 'kitMedical'],
              ].map(([value, label, icon]) => (
                <label
                  key={value}
                  className={`service-item ${cercaDe.includes(value) ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={cercaDe.includes(value)}
                    onChange={() => toggleCercaDe(value)}
                  />
                  <span className="service-label"><AppIcon name={icon as any} /> {label}</span>
                </label>
              ))}
            </div>

            {cercaDe.includes('universidad') && (
              <div className="input-group" style={{ marginTop: '12px' }}>
                <label>¿Cerca de qué universidad?</label>
                <select
                  value={universidadCercana}
                  onChange={(e) => setUniversidadCercana(e.target.value)}
                >
                  <option value="">Selecciona la universidad</option>
                  {UNIVERSIDADES.map((group) => (
                    <optgroup label={group.group} key={group.group}>
                      {group.options.map((u) => (
                        <option value={u} key={u}>
                          {u}
                        </option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="moneyBill" /></span>
              Precio
            </div>
            <div className="input-group">
              <label>Precio mensual</label>
              <div className="price-input-wrapper">
                <span className="currency-symbol">Bs.</span>
                <input
                  type="number"
                  placeholder="500"
                  min="0"
                  value={precio}
                  onChange={(e) => setPrecio(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Reglas */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="fileLines" /></span>
              Reglas de la Casa
            </div>
            <div className="input-group">
              <label>Describe las reglas</label>
              <textarea
                placeholder="Ej: No fumar, no mascotas, horario de visitas hasta las 10pm, etc."
                value={reglas}
                onChange={(e) => setReglas(e.target.value)}
              />
            </div>
          </div>

          {/* Disponibilidad */}
          <div className="section">
            <div className="section-title">
              <span className="section-icon"><AppIcon name="clock" /></span>
              Disponibilidad
            </div>
            <div className="options-group">
              <button
                type="button"
                className={`option-btn ${disponibilidad === 'inmediata' ? 'selected' : ''}`}
                onClick={() => setDisponibilidad('inmediata')}
              >
                Inmediata
              </button>
              <button
                type="button"
                className={`option-btn ${disponibilidad === 'fecha' ? 'selected' : ''}`}
                onClick={() => setDisponibilidad('fecha')}
              >
                Desde fecha
              </button>
            </div>
            {disponibilidad === 'fecha' && (
              <div className="input-group" style={{ marginTop: '15px' }}>
                <label>Disponible desde</label>
                <input type="date" value={fecha} onChange={(e) => setFecha(e.target.value)} />
              </div>
            )}
          </div>

          {/* Botón publicar */}
          <div className="submit-section">
            <button className="btn-submit" onClick={publicarCuarto}>
              Publicar Cuarto
            </button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
