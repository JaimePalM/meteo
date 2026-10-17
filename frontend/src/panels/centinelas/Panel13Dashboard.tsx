import { FC } from 'react';
import { DataTimestamp } from '../../components/DataTimestamp';
import { usePublicData } from '../../context/PublicDataContext';

export const Panel13Dashboard: FC = () => {
  const { centinelas: { current, loading, error } } = usePublicData();

  if (error) {
    return <div className="public-display centinelas-display"><div className="display-error"><h1>Error al cargar datos</h1><p>{error}</p></div></div>;
  }

  return (
    <div className="public-display centinelas-display panel-full-height centinelas-data-panel">
      <header className="panel-header">
        <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="panel-logo" />
        <h1 className="panel-title">CENTINELAS</h1>
        <DataTimestamp recordedDate={current?.recorded_date} />
      </header>

      <div className="panel-full-height-content">
        <div className="dashboard-section conditions centered-card">
          <div className="weather-card">
            <div className="weather-header">
              <h2>Estado de la observación</h2>
              <span className="weather-date">{loading || !current ? 'Cargando última medición…' : new Intl.DateTimeFormat('es-ES', { dateStyle: 'full', timeZone: 'UTC' }).format(new Date(current.recorded_date))}</span>
            </div>
            {current ? (
              <div className="centinelas-grid full-width-grid">
                <div className="centinelas-item temperature"><span className="centinelas-emoji">🌡️</span><div className="centinelas-content"><span className="centinelas-label">Temperatura del agua</span><span className="centinelas-value">{current.temperatura_agua} °C</span></div></div>
                <div className="centinelas-item flora"><span className="centinelas-emoji">🌿</span><div className="centinelas-content"><span className="centinelas-label">Flora invasora</span><span className="centinelas-value">{current.flora_invasora}</span></div></div>
                <div className="centinelas-item residuos"><span className="centinelas-emoji">🗑️</span><div className="centinelas-content"><span className="centinelas-label">Residuos</span><span className="centinelas-value">{current.residuos}</span></div></div>
                <div className="centinelas-item efluentes"><span className="centinelas-emoji">💧</span><div className="centinelas-content"><span className="centinelas-label">Efluentes</span><span className="centinelas-value">{current.efluentes}</span></div></div>
                <div className="centinelas-item mortandades"><span className="centinelas-emoji">🐟</span><div className="centinelas-content"><span className="centinelas-label">Mortandades</span><span className="centinelas-value">{current.mortandades}</span></div></div>
              </div>
            ) : <div className="panel-loading">Cargando datos de Centinelas…</div>}
          </div>
        </div>
      </div>
    </div>
  );
};
