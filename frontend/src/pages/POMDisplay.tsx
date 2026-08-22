import { FC } from 'react';

export const POMDisplay: FC = () => {
  return (
    <div className="public-display pom-display">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">POM</h1>
      </header>

      <div className="dashboard-grid">
        <div className="dashboard-left">
          <div className="dashboard-section conditions">
            <div className="weather-card">
              <div className="weather-header">
                <h2>📋 POM - Plan de Operaciones</h2>
                <p className="weather-date">Gestión de operaciones</p>
              </div>
              <div className="weather-grid modern">
                <div className="weather-item">
                  <span className="item-emoji">📝</span>
                  <div className="item-content">
                    <span className="label">Operaciones activas</span>
                    <span className="value">8</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">✅</span>
                  <div className="item-content">
                    <span className="label">Completadas hoy</span>
                    <span className="value">12</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">⏳</span>
                  <div className="item-content">
                    <span className="label">Pendientes</span>
                    <span className="value">3</span>
                  </div>
                </div>
                <div className="weather-item">
                  <span className="item-emoji">👥</span>
                  <div className="item-content">
                    <span className="label">Equipos en campo</span>
                    <span className="value">5</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="dashboard-right">
          <div className="dashboard-section humidity">
            <h3>📊 Estado de Equipos</h3>
            <div className="chart-container">
              <div style={{ height: '200px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <span>Equipo Alpha</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Operativo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <span>Equipo Bravo</span>
                  <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>● En misión</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <span>Equipo Charlie</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Operativo</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <span>Equipo Delta</span>
                  <span style={{ color: '#ef4444', fontWeight: 'bold' }}>● Mantenimiento</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}>
                  <span>Equipo Echo</span>
                  <span style={{ color: '#10b981', fontWeight: 'bold' }}>● Operativo</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="temperature-chart-full">
        <div className="dashboard-section temperature">
          <h3>📅 Próximas Operaciones</h3>
          <div className="chart-container" style={{ height: '300px', display: 'flex', flexDirection: 'column', gap: '12px', padding: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', borderLeft: '4px solid #FF8C00' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Inspección Río Ebro</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Equipo Bravo • 10:00 - 14:00</div>
              </div>
              <span style={{ background: '#FF8C00', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>PROGRAMADA</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', borderLeft: '4px solid #10b981' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Mantenimiento Sensores</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Equipo Delta • 15:00 - 17:00</div>
              </div>
              <span style={{ background: '#10b981', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>EN PROGRESO</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', borderLeft: '4px solid #3b82f6' }}>
              <div>
                <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Calibración Estaciones</div>
                <div style={{ fontSize: '12px', color: '#9CA3AF' }}>Equipo Alpha • Mañana 09:00</div>
              </div>
              <span style={{ background: '#3b82f6', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold' }}>PENDIENTE</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};