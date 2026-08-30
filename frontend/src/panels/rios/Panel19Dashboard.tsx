import { FC } from 'react';
import { useRiverData } from '../../hooks/useRiverData';
import { RiverCard } from '../../components/RiverCard';
import { RiverTemperatureChart } from '../../components/RiverTemperatureChart';

export const Panel19Dashboard: FC = () => {
  const { current, monthly, loading, error } = useRiverData();

  if (error) {
    return (
      <div className="public-display river-display">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <h1>Error al cargar datos del río</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="public-display river-display">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">RÍOS</h1>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="dashboard-section conditions">
            <RiverCard data={current} loading={loading} />
          </div>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-section temperature">
            <h3>📈 Temperatura del Río (30 días)</h3>
            <RiverTemperatureChart data={monthly} loading={loading} height={300} />
          </div>
        </div>
      </div>

      <div className="river-logos-bottom">
        <img src="/logo_cambera.png" alt="Cambera" className="river-logo-bottom" />
        <img src="/proyecto-rios-nobg.png" alt="Proyecto Ríos" className="river-logo-bottom" />
      </div>
    </div>
  );
};