import { FC } from 'react';
import { DataTimestamp } from '../../components/DataTimestamp';
import { RiverCard } from '../../components/RiverCard';
import { usePublicData } from '../../context/PublicDataContext';

export const Panel19Dashboard: FC = () => {
  const { river: { current, loading, error } } = usePublicData();

  if (error) {
    return <div className="public-display river-display"><div className="display-error"><h1>Error al cargar datos del río</h1><p>{error}</p></div></div>;
  }

  return (
    <div className="public-display river-display river-data-panel">
      <header className="panel-header">
        <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="panel-logo" />
        <h1 className="panel-title">RÍOS</h1>
        <DataTimestamp recordedDate={current?.recorded_date} />
      </header>

      <div className="dashboard-grid river-cards-grid">
        <div className="dashboard-section conditions"><RiverCard data={current} loading={loading} /></div>
        <div className="dashboard-section conditions"><RiverCard data={current} loading={loading} /></div>
      </div>

      <div className="river-logos-bottom">
        <img src="/logo_cambera.png" alt="Cambera" className="river-logo-bottom" />
        <img src="/proyecto-rios-nobg.png" alt="Proyecto Ríos" className="river-logo-bottom" />
      </div>
    </div>
  );
};
