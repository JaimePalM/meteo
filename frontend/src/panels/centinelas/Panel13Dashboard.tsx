import { FC } from 'react';
import { useCentinelasData } from '../../hooks/useCentinelasData';
import { SimpleLineChart } from '../../components/LineChart';

export const Panel13Dashboard: FC = () => {
  const { current, monthly, loading, error } = useCentinelasData();

  if (error) {
    return (
      <div className="public-display centinelas-display">
        <div style={{ padding: '40px', textAlign: 'center', color: 'red' }}>
          <h1>Error al cargar datos</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading || !current) {
    return (
      <div className="public-display centinelas-display panel-split-horizontal">
        <header className="panel-header">
          <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="panel-logo" />
          <h1 className="panel-title">CENTINELAS</h1>
        </header>
        <div className="panel-split-content">
          <div className="panel-split-top">
            <div className="dashboard-section conditions">
              <div className="weather-card loading">
                <p>Cargando datos...</p>
              </div>
            </div>
          </div>
          <div className="panel-split-bottom">
            <div className="dashboard-section chart">
              <div className="chart-container">
                <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                  Cargando gráfico...
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Get last 30 days of temperature data for chart
  const chartData = monthly.map((item) => ({
    date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    temp: typeof item.temperatura_agua === 'string' ? parseFloat(item.temperatura_agua) : item.temperatura_agua,
  }));

  return (
    <div className="public-display centinelas-display panel-split-horizontal">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">CENTINELAS</h1>
      </header>

      <div className="panel-split-content">
        {/* Top half: Dashboard full width */}
        <div className="panel-split-top">
          <div className="dashboard-section conditions full-width-dashboard">
            <div className="weather-card">
              <div className="weather-header">
                <h2>📊 Centinelas - Datos Actuales</h2>
                <span className="weather-date">
                  {new Date(current.recorded_date).toLocaleDateString('es-ES', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </span>
              </div>

              <div className="centinelas-grid full-width-grid">
                <div className="centinelas-item temperature">
                  <span className="centinelas-emoji">🌡️</span>
                  <div className="centinelas-content">
                    <span className="centinelas-label">Temperatura agua</span>
                    <span className="centinelas-value">{current.temperatura_agua}°C</span>
                  </div>
                </div>

                <div className="centinelas-item flora">
                  <span className="centinelas-emoji">🌿</span>
                  <div className="centinelas-content">
                    <span className="centinelas-label">Flora invasora</span>
                    <span className="centinelas-value">{current.flora_invasora}</span>
                  </div>
                </div>

                <div className="centinelas-item residuos">
                  <span className="centinelas-emoji">🗑️</span>
                  <div className="centinelas-content">
                    <span className="centinelas-label">Residuos</span>
                    <span className="centinelas-value">{current.residuos}</span>
                  </div>
                </div>

                <div className="centinelas-item efluentes">
                  <span className="centinelas-emoji">💧</span>
                  <div className="centinelas-content">
                    <span className="centinelas-label">Efluentes</span>
                    <span className="centinelas-value">{current.efluentes}</span>
                  </div>
                </div>

                <div className="centinelas-item mortandades">
                  <span className="centinelas-emoji">🐟</span>
                  <div className="centinelas-content">
                    <span className="centinelas-label">Mortandades</span>
                    <span className="centinelas-value">{current.mortandades}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom half: Chart full width */}
        <div className="panel-split-bottom">
          <div className="dashboard-section chart">
            <h3>📈 Evolución Temperatura Agua (30 días)</h3>
            <div className="chart-container full-width-chart" style={{ height: '100%' }}>
              <SimpleLineChart data={chartData} color="#9F7AEA" yAxisLabel="°C" height={300} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};