import { FC } from 'react';
import { useWeatherData } from '../hooks/useWeatherData';
import { WeatherCard } from '../components/WeatherCard';
import { TemperatureChart } from '../components/TemperatureChart';
import { HumidityChart } from '../components/HumidityChart';
import { PrecipitationChart } from '../components/PrecipitationChart';
import { PressureGauge } from '../components/PressureGauge';

export const PublicDisplay: FC = () => {
  const { current, monthly, loading, error } = useWeatherData();

  if (error) {
    return (
      <div className="public-display">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <h1>Error al cargar datos</h1>
          <p>{error}</p>
          <p>Por favor, recarga la página en unos segundos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-display">
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Current Conditions */}
          <div className="dashboard-section conditions">
            <WeatherCard data={current} loading={loading} />
          </div>

          {/* Temperature Chart */}
          <div className="dashboard-section temperature">
            <TemperatureChart data={monthly} loading={loading} />
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Pressure Gauge */}
          <div className="dashboard-section pressure">
            <h3>🔹 Presión Atmosférica</h3>
            {current && <PressureGauge value={current.pressure} />}
          </div>

          {/* Humidity Chart */}
          <div className="dashboard-section humidity">
            <HumidityChart data={monthly} loading={loading} />
          </div>

          {/* Precipitation Chart */}
          <div className="dashboard-section precipitation">
            <PrecipitationChart data={monthly} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};
