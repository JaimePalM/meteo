import { FC } from 'react';

export const CentinelasDisplay: FC = () => {
  return (
    <div className="public-display centinelas-display">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">CENTINELAS</h1>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="dashboard-section conditions">
            <div className="weather-card">
              <div className="weather-header">
                <h2>🛰️ Centinelas</h2>
                <p className="weather-date">Datos de satélite</p>
              </div>
              <div className="weather-grid modern">
                <div className="weather-item">
                  <span className="item-emoji">📡</span>
                  <div className="item-content">
                    <span className="label">Estado</span>
                    <span className="value">Activo</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">🌍</span>
                  <div className="item-content">
                    <span className="label">Cobertura</span>
                    <span className="value">Global</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">🔄</span>
                  <div className="item-content">
                    <span className="label">Última actualización</span>
                    <span className="value">Hace 5 min</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">📊</span>
                  <div className="item-content">
                    <span className="label">Satélites activos</span>
                    <span className="value">12/15</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-section humidity">
            <h3>📈 Actividad Reciente</h3>
            <div className="chart-container">
              <div style={{ height: '200px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
                Gráfico de actividad de satélites
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="temperature-chart-full">
        <div className="dashboard-section temperature">
          <h3>🗺️ Mapa de Cobertura</h3>
          <div className="chart-container" style={{ height: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280' }}>
            Visualización del mapa de cobertura satelital
          </div>
        </div>
      </div>
    </div>
  );
};