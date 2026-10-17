import { FC } from 'react';
import { DataTimestamp } from '../../components/DataTimestamp';
import { CentinelasData } from '../../services/api';
import { usePublicData } from '../../context/PublicDataContext';

const Observation: FC<{ item: CentinelasData }> = ({ item }) => (
  <article className="centinelas-observation">
    <div className="centinelas-observation-header">
      <h2>Observación del curso</h2>
      <span>{new Intl.DateTimeFormat('es-ES', { dateStyle: 'long', timeZone: 'UTC' }).format(new Date(item.recorded_date))}</span>
    </div>
    <div className="centinelas-observation-grid">
      <div className="centinelas-item"><span className="centinelas-emoji">🌡️</span><div className="centinelas-content"><span className="centinelas-label">Temperatura del agua</span><span className="centinelas-value">{item.temperatura_agua} °C</span></div></div>
      <div className="centinelas-item"><span className="centinelas-emoji">🌿</span><div className="centinelas-content"><span className="centinelas-label">Flora invasora</span><span className="centinelas-value">{item.flora_invasora}</span></div></div>
      <div className="centinelas-item"><span className="centinelas-emoji">🗑️</span><div className="centinelas-content"><span className="centinelas-label">Residuos</span><span className="centinelas-value">{item.residuos}</span></div></div>
      <div className="centinelas-item"><span className="centinelas-emoji">💧</span><div className="centinelas-content"><span className="centinelas-label">Efluentes</span><span className="centinelas-value">{item.efluentes}</span></div></div>
      <div className="centinelas-item"><span className="centinelas-emoji">🐟</span><div className="centinelas-content"><span className="centinelas-label">Mortandades</span><span className="centinelas-value">{item.mortandades}</span></div></div>
    </div>
  </article>
);

export const Panel13Dashboard: FC = () => {
  const { centinelas: { monthly, loading, error } } = usePublicData();
  const observation = monthly[0];

  if (error) return <div className="public-display centinelas-display"><div className="display-error"><h1>Error al cargar datos</h1><p>{error}</p></div></div>;

  return (
    <div className="public-display centinelas-display panel-full-height centinelas-data-panel">
      <header className="panel-header">
        <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="panel-logo" />
        <h1 className="panel-title">CENTINELAS</h1>
        <DataTimestamp recordedDate={observation?.recorded_date} />
      </header>
      <div className="panel-full-height-content">
        <section className="centinelas-observations">
          {loading && <div className="panel-loading">Cargando observaciones de Centinelas…</div>}
          {!loading && observation && <Observation item={observation} />}
          {!loading && !observation && <div className="panel-loading">No hay observación de Centinelas para el curso académico actual.</div>}
        </section>
      </div>
    </div>
  );
};
