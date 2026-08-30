import { FC } from 'react';
import { usePublicData } from '../../context/PublicDataContext';
import { SimpleLineChart } from '../../components/LineChart';
import { DataTimestamp } from '../../components/DataTimestamp';

export const Panel16SeaTemp: FC = () => {
  const { pom: { monthly, loading, error } } = usePublicData();

  // Get last 12 months (one per month)
  const getMonthlyData = (data: any[]) => {
    const monthlyMap = new Map();
    data.forEach(item => {
      const date = new Date(item.recorded_date);
      const key = `${date.getFullYear()}-${date.getMonth()}`;
      if (!monthlyMap.has(key) || new Date(monthlyMap.get(key).recorded_date) < date) {
        monthlyMap.set(key, item);
      }
    });
    return Array.from(monthlyMap.values())
      .sort((a, b) => new Date(a.recorded_date).getTime() - new Date(b.recorded_date).getTime())
      .slice(-12);
  };

  const monthlyData = monthly ? getMonthlyData(monthly) : [];

  if (error) {
    return (
      <div className="public-display pom-display panel-split-horizontal">
        <header className="panel-header">
          <img 
            src="/logo-calasanz.png" 
            alt="Logo Calasanz Santander" 
            className="panel-logo"
          />
          <h1 className="panel-title">POM</h1>
        </header>
        <div style={{ padding: '40px', textAlign: 'center', color: 'red', height: '100%' }}>
          <h1>Error al cargar datos</h1>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="public-display pom-display panel-split-horizontal">
        <header className="panel-header">
          <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="panel-logo" />
          <h1 className="panel-title">POM</h1>
        </header>
        <div className="panel-split-content">
          <div className="panel-split-top">
            <div className="dashboard-section conditions">
              <p style={{ textAlign: 'center', padding: '40px', color: 'white' }}>Cargando datos de temperatura del mar...</p>
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

  const chartData = monthlyData.map((item) => ({
    date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
      month: 'short',
      year: '2-digit',
    }),
    temp: typeof item.temperatura_mar === 'string' ? parseFloat(item.temperatura_mar) : item.temperatura_mar,
  }));

  return (
    <div className="public-display pom-display panel-split-horizontal">
      <header className="panel-header">
        <img 
          src="/logo-calasanz.png" 
          alt="Logo Calasanz Santander" 
          className="panel-logo"
        />
        <h1 className="panel-title">POM</h1>
        <DataTimestamp recordedDate={monthlyData[monthlyData.length - 1]?.recorded_date} />
      </header>

      <div className="panel-split-content">
        {/* Top half: 12 months in 6x2 grid */}
        <div className="panel-split-top">
          <div className="dashboard-section conditions full-width-dashboard">
            <div className="weather-card">
              <div className="weather-header">
                <h2>🌊 Temperatura del Mar - Últimos 12 Meses</h2>
              </div>
              <div className="pom-grid-12">
                {monthlyData.map((item) => {
                  const measurementDate = new Date(item.recorded_date);
                  const today = new Date();
                  const isCurrentMonth = measurementDate.getUTCFullYear() === today.getFullYear()
                    && measurementDate.getUTCMonth() === today.getMonth();

                  return (
                  <div key={item.id} className={`pom-month-item ${isCurrentMonth ? 'current-month' : ''}`} aria-current={isCurrentMonth ? 'date' : undefined}>
                    <span className="pom-month-label">
                      {new Date(item.recorded_date).toLocaleDateString('es-ES', {
                        month: 'short',
                        year: '2-digit',
                      })}
                    </span>
                    <span className="pom-month-value">
                      {typeof item.temperatura_mar === 'string' ? parseFloat(item.temperatura_mar) : item.temperatura_mar}°C
                    </span>
                  </div>
                  );
                })}
                {monthlyData.length === 0 && (
                  <div className="pom-empty" style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'rgba(255,255,255,0.7)' }}>
                    No hay datos disponibles
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom half: Chart with 12 points */}
        <div className="panel-split-bottom">
          <div className="dashboard-section chart">
            <h3>📈 Evolución Temperatura Mar (12 meses)</h3>
            <div className="chart-container full-width-chart">
              <SimpleLineChart data={chartData} color="#278145" yAxisLabel="°C" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
