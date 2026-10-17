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
    <div className="public-display pom-display panel-split-horizontal pom-data-panel">
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
        <div className="panel-split-top">
          <div className="pom-latest-card">
            <span className="pom-latest-label">Última temperatura del mar</span>
            <strong className="pom-latest-value">
              {monthlyData.length > 0 ? `${Number(monthlyData[monthlyData.length - 1].temperatura_mar).toFixed(1)} °C` : '—'}
            </strong>
          </div>
        </div>

        <div className="panel-split-bottom">
          <div className="dashboard-section chart">
            <h3>Evolución de la temperatura del mar · últimos 12 meses</h3>
            <div className="chart-container full-width-chart">
              <SimpleLineChart data={chartData} color="#278145" yAxisLabel="°C" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
