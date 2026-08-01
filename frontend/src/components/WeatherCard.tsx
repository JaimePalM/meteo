import { FC } from 'react';
import { WeatherData } from '../services/api';

interface WeatherCardProps {
  data: WeatherData | null;
  loading: boolean;
  pressure?: number | null;
}

// Función para obtener emoji según temperatura
const getTempEmoji = (temp: number): string => {
  if (temp < 0) return '❄️';
  if (temp < 10) return '🥶';
  if (temp < 15) return '🧊';
  if (temp < 20) return '😐';
  if (temp < 25) return '🌤️';
  if (temp < 30) return '☀️';
  return '🔥';
};

// Función para obtener color según temperatura
const getTempColor = (temp: number): string => {
  if (temp < 0) return '#4ECDC4';
  if (temp < 10) return '#6C9CFF';
  if (temp < 15) return '#87CEEB';
  if (temp < 20) return '#FFD93D';
  if (temp < 25) return '#FF9F43';
  if (temp < 30) return '#FF6B6B';
  return '#C92A2A';
};

// Función para obtener estado de humedad
const getHumidityEmoji = (humidity: number): string => {
  if (humidity < 30) return '🏜️';
  if (humidity < 50) return '😐';
  if (humidity < 70) return '💧';
  return '🌧️';
};

export const WeatherCard: FC<WeatherCardProps> = ({ data, loading, pressure }) => {
  if (loading) {
    return (
      <div className="weather-card loading">
        <p>Cargando datos meteorológicos...</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="weather-card error">
        <p>No hay datos disponibles</p>
      </div>
    );
  }

  const tempMaxNum = typeof data.temperature_max === 'string' ? parseFloat(data.temperature_max) : data.temperature_max;
  const tempMinNum = typeof data.temperature_min === 'string' ? parseFloat(data.temperature_min) : data.temperature_min;
  const humidityNum = typeof data.humidity === 'string' ? parseFloat(data.humidity) : data.humidity;
  const precipNum = typeof data.precipitation === 'string' ? parseFloat(data.precipitation) : data.precipitation;

  const tempMaxColor = getTempColor(tempMaxNum);
  const tempMinColor = getTempColor(tempMinNum);
  const tempMaxEmoji = getTempEmoji(tempMaxNum);
  const tempMinEmoji = getTempEmoji(tempMinNum);
  const humidityEmoji = getHumidityEmoji(humidityNum);

  return (
    <div className="weather-card">
      <div className="weather-header">
        <h2>Condiciones Actuales</h2>
        <span className="weather-date">
          {new Date(data.recorded_date).toLocaleDateString('es-ES', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </span>
      </div>

      <div className="weather-grid modern">
        {/* Temperatura Máxima */}
        <div className="weather-item temperature-max" style={{ borderLeftColor: tempMaxColor }}>
          <div className="item-emoji">{tempMaxEmoji}</div>
          <div className="item-content">
            <span className="label">Máxima</span>
            <span className="value" style={{ color: tempMaxColor }}>
              {tempMaxNum}°C
            </span>
          </div>
        </div>

        {/* Temperatura Mínima */}
        <div className="weather-item temperature-min" style={{ borderLeftColor: tempMinColor }}>
          <div className="item-emoji">{tempMinEmoji}</div>
          <div className="item-content">
            <span className="label">Mínima</span>
            <span className="value" style={{ color: tempMinColor }}>
              {tempMinNum}°C
            </span>
          </div>
        </div>

        {/* Humedad */}
        <div className="weather-item humidity">
          <div className="item-emoji">{humidityEmoji}</div>
          <div className="item-content">
            <span className="label">Humedad</span>
            <div className="humidity-bar">
              <div 
                className="humidity-fill" 
                style={{ width: `${humidityNum}%` }}
              />
            </div>
            <span className="value">{humidityNum}%</span>
          </div>
        </div>

        {/* Precipitación */}
        <div className="weather-item precipitation">
          <div className="item-emoji">🌧️</div>
          <div className="item-content">
            <span className="label">Precipitación</span>
            <span className="value">{precipNum} mm</span>
          </div>
        </div>

        {/* Presión */}
        {pressure !== null && pressure !== undefined && (
          <div className="weather-item pressure">
            <div className="item-emoji">🔹</div>
            <div className="item-content">
              <span className="label">Presión</span>
              <span className="value">{pressure} hPa</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
