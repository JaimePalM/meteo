import { FC } from 'react';
import { RiverData } from '../services/api';

interface RiverCardProps {
  data: RiverData | null;
  loading: boolean;
}

const getRiverEmoji = (temp: number): string => {
  if (temp >= 22) return '🌊';
  if (temp >= 16) return '🐟';
  if (temp >= 10) return '💧';
  return '🧊';
};

const getRiverStatus = (temp: number): string => {
  if (temp >= 22) return 'Cálido';
  if (temp >= 16) return 'Templado';
  if (temp >= 10) return 'Fresco';
  return 'Frío';
};

const getRiverColor = (temp: number): string => {
  if (temp >= 22) return '#FF8C00';
  if (temp >= 16) return '#B3E5FC';
  if (temp >= 10) return '#B3E5FC';
  return '#B3E5FC';
};

export const RiverCard: FC<RiverCardProps> = ({ data, loading }) => {
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="weather-card">
        <div className="weather-header">
          <h2>Temperatura del Río</h2>
          <p>{today}</p>
        </div>
        <p>Cargando datos meteorológicos...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="weather-card">
        <div className="weather-header">
          <h2>Temperatura del Río</h2>
          <p>{today}</p>
        </div>
        <p>Sin datos disponibles</p>
      </div>
    );
  }

  const temp = parseFloat(data.temperature as unknown as string);
  const emoji = getRiverEmoji(temp);
  const status = getRiverStatus(temp);
  const color = getRiverColor(temp);
  const recordedDate = new Date(data.recorded_date).toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2>Temperatura del Río</h2>
        <p>{recordedDate}</p>
      </div>

      <div className="river-main-temp">
        <div className="river-temp-display">
          <span className="river-emoji">{emoji}</span>
          <span className="river-temp-value" style={{ color }}>
            {temp.toFixed(1)}°C
          </span>
        </div>
        <div className="river-status" style={{ color }}>
          {status}
        </div>
      </div>

      <div className="river-info-grid">
        <div className="river-info-item">
          <span className="river-info-label">Calidad biológica del agua</span>
          <span className="river-info-value">{data.calidad_biologica || 'Buena'}</span>
        </div>
        <div className="river-info-item">
          <span className="river-info-label">Estado del río</span>
          <span className="river-info-value">{data.estado_rio || 'Bueno'}</span>
        </div>
        <div className="river-info-item">
          <span className="river-info-label">Bosque de rivera</span>
          <span className="river-info-value">{data.bosque_rivera || 'Bueno'}</span>
        </div>
        <div className="river-info-item">
          <span className="river-info-label">Temperatura</span>
          <span className="river-info-value">{temp.toFixed(2)}°C</span>
        </div>
      </div>
    </div>
  );
};
