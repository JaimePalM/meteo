import { FC } from 'react';
import { useWeatherData } from '../../hooks/useWeatherData';
import { TemperatureChart } from '../../components/TemperatureChart';

export const Panel4TempChart: FC = () => {
  const { monthly, loading, error } = useWeatherData();

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
    <div className="public-display meteoescuela-display">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">METEOESCUELA</h1>
      </header>

      <div className="temperature-chart-full">
        <div className="dashboard-section temperature">
          <TemperatureChart data={monthly} loading={loading} />
        </div>
      </div>
    </div>
  );
};