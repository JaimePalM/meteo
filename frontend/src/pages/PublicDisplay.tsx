import { FC } from 'react';
import { useWeatherData } from '../hooks/useWeatherData';
import { WeatherCard } from '../components/WeatherCard';
import { TemperatureChart } from '../components/TemperatureChart';
import { HumidityChart } from '../components/HumidityChart';

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
      {/* Header with logo left, title center */}
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">METEOESCUELA</h1>
      </header>

      {/* Dashboard content */}
      <div className="dashboard-grid">
        {/* Left Column */}
        <div className="dashboard-left">
          {/* Current Conditions */}
          <div className="dashboard-section conditions">
            <WeatherCard data={current} loading={loading} pressure={current?.pressure} />
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-right">
          {/* Humidity Chart */}
          <div className="dashboard-section humidity">
            <HumidityChart data={monthly} loading={loading} />
          </div>
        </div>
      </div>

      {/* Full Width Temperature Chart */}
      <div className="temperature-chart-full">
        <div className="dashboard-section temperature">
          <TemperatureChart data={monthly} loading={loading} />
        </div>
      </div>
    </div>
  );
};
