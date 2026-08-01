import { FC } from 'react';
import { useRiverData } from '../hooks/useRiverData';
import { RiverCard } from '../components/RiverCard';
import { RiverTemperatureChart } from '../components/RiverTemperatureChart';

export const RiverDisplay: FC = () => {
  const { current, monthly, loading, error } = useRiverData();

  if (error) {
    return (
      <div className="public-display">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <h1>Error al cargar datos del río</h1>
          <p>{error}</p>
          <p>Por favor, recarga la página en unos segundos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-display river-display">
      {/* Logo Container */}
      <div className="logo-top-container">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="logo-top"
        />
      </div>

      {/* Dashboard content */}
      <div className="dashboard-grid">
        {/* Left Column: Current river conditions */}
        <div className="dashboard-left">
          <div className="dashboard-section conditions">
            <RiverCard data={current} loading={loading} />
          </div>
        </div>

        {/* Right Column: Historical chart */}
        <div className="dashboard-right">
          <div className="dashboard-section temperature">
            <h3>📈 Temperatura del Río (30 días)</h3>
            <RiverTemperatureChart data={monthly} loading={loading} />
          </div>
        </div>
      </div>
    </div>
  );
};
