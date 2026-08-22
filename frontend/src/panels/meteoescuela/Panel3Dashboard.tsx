import { FC } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { WeatherCard } from '../../components/WeatherCard';

export const Panel3Dashboard: FC = () => {
  const { current, loading, error } = useWeatherData();

  if (error) {
    return (
      <div className="public-display meteoescuela-display">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <h1>Error al cargar datos</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-display meteoescuela-display panel-full-height">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">METEOESCUELA</h1>
      </header>

      <div className="panel-full-height-content">
        <div className="dashboard-section conditions centered-card">
          <WeatherCard data={current} loading={loading} pressure={current?.pressure} />
        </div>
      </div>
    </div>
  );
};