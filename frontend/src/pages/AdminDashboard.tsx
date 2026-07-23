import { FC, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminApi, WeatherData, RiverData } from '../services/api';

export const AdminDashboard: FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'weather' | 'river'>('weather');

  // ─── Weather state ────────────────────────────────────────────────────────
  const [weatherHistory, setWeatherHistory] = useState<WeatherData[]>([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [showWeatherForm, setShowWeatherForm] = useState(false);
  const [weatherEditingId, setWeatherEditingId] = useState<number | null>(null);
  const [weatherFormData, setWeatherFormData] = useState({
    temperature_max: '',
    temperature_min: '',
    humidity: '',
    pressure: '',
    precipitation: '',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  // ─── River state ──────────────────────────────────────────────────────────
  const [riverHistory, setRiverHistory] = useState<RiverData[]>([]);
  const [riverLoading, setRiverLoading] = useState(false);
  const [showRiverForm, setShowRiverForm] = useState(false);
  const [riverEditingId, setRiverEditingId] = useState<number | null>(null);
  const [riverFormData, setRiverFormData] = useState({
    temperature: '',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadWeatherHistory();
    loadRiverHistory();
  }, []);

  // ─── Weather handlers ─────────────────────────────────────────────────────
  const loadWeatherHistory = async () => {
    try {
      setWeatherLoading(true);
      const response = await adminApi.getWeatherHistory();
      let data = response.data;
      if (typeof data === 'string') { try { data = JSON.parse(data); } catch { data = []; } }
      if (!Array.isArray(data)) { data = (typeof data === 'object' && data !== null) ? Object.values(data) : (data ? [data] : []); }
      setWeatherHistory(data);
    } catch (error: any) {
      alert(`Error al cargar el histórico: ${error.response?.data?.error || error.message}`);
    } finally {
      setWeatherLoading(false);
    }
  };

  const handleWeatherSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!weatherFormData.temperature_max || !weatherFormData.temperature_min || !weatherFormData.humidity || !weatherFormData.pressure || !weatherFormData.recorded_date) {
      alert('Por favor, completa todos los campos');
      return;
    }
    const data = {
      temperature_max: parseFloat(weatherFormData.temperature_max),
      temperature_min: parseFloat(weatherFormData.temperature_min),
      humidity: parseInt(weatherFormData.humidity),
      pressure: parseFloat(weatherFormData.pressure),
      precipitation: parseFloat(weatherFormData.precipitation) || 0,
      recorded_date: weatherFormData.recorded_date,
    };
    if (data.humidity < 0 || data.humidity > 100) { alert('La humedad debe estar entre 0 y 100'); return; }
    try {
      if (weatherEditingId) {
        await adminApi.updateWeather(weatherEditingId, data);
      } else {
        await adminApi.createWeather(data as any);
      }
      setWeatherFormData({ temperature_max: '', temperature_min: '', humidity: '', pressure: '', precipitation: '', recorded_date: new Date().toISOString().split('T')[0] });
      setWeatherEditingId(null);
      setShowWeatherForm(false);
      alert('Datos guardados correctamente');
      loadWeatherHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleWeatherDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try { await adminApi.deleteWeather(id); loadWeatherHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  // ─── River handlers ───────────────────────────────────────────────────────
  const loadRiverHistory = async () => {
    try {
      setRiverLoading(true);
      const response = await adminApi.getRiverHistory();
      let data = response.data;
      if (!Array.isArray(data)) data = data ? [data] : [];
      setRiverHistory(data);
    } catch (error: any) {
      alert(`Error al cargar el histórico del río: ${error.response?.data?.error || error.message}`);
    } finally {
      setRiverLoading(false);
    }
  };

  const handleRiverSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!riverFormData.temperature || !riverFormData.recorded_date) {
      alert('Por favor, completa todos los campos');
      return;
    }
    const data = {
      temperature: parseFloat(riverFormData.temperature),
      recorded_date: riverFormData.recorded_date,
    };
    if (isNaN(data.temperature)) { alert('Temperatura inválida'); return; }
    try {
      if (riverEditingId) {
        await adminApi.updateRiver(riverEditingId, data);
      } else {
        await adminApi.createRiver(data);
      }
      setRiverFormData({ temperature: '', recorded_date: new Date().toISOString().split('T')[0] });
      setRiverEditingId(null);
      setShowRiverForm(false);
      alert('Datos del río guardados correctamente');
      loadRiverHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleRiverDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro del río?')) return;
    try { await adminApi.deleteRiver(id); loadRiverHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <h1>Panel Administrativo</h1>
        <button onClick={logout} className="logout-btn">
          Cerrar Sesión
        </button>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'weather' ? 'active' : ''}`}
          onClick={() => setActiveTab('weather')}
        >
          🌤️ Meteorológico
        </button>
        <button
          className={`admin-tab ${activeTab === 'river' ? 'active' : ''}`}
          onClick={() => setActiveTab('river')}
        >
          🌊 Río
        </button>
      </div>

      <main className="admin-main">

        {/* ─── Weather Tab ─────────────────────────────────────────────── */}
        {activeTab === 'weather' && (
          <>
            <section className="admin-form-section">
              <button className="btn-primary" onClick={() => setShowWeatherForm(!showWeatherForm)}>
                {showWeatherForm ? 'Cancelar' : 'Agregar Registro Meteorológico'}
              </button>

              {showWeatherForm && (
                <form onSubmit={handleWeatherSubmit} className="weather-form">
                  <h2>{weatherEditingId ? 'Editar Registro' : 'Nuevo Registro Meteorológico'}</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="w-date">Fecha</label>
                      <input id="w-date" type="date" value={weatherFormData.recorded_date}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, recorded_date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="w-temp-max">Temperatura Máxima (°C)</label>
                      <input id="w-temp-max" type="number" step="0.1" value={weatherFormData.temperature_max}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, temperature_max: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="w-temp-min">Temperatura Mínima (°C)</label>
                      <input id="w-temp-min" type="number" step="0.1" value={weatherFormData.temperature_min}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, temperature_min: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="w-humidity">Humedad (%)</label>
                      <input id="w-humidity" type="number" min="0" max="100" value={weatherFormData.humidity}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, humidity: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="w-pressure">Presión (hPa)</label>
                      <input id="w-pressure" type="number" step="0.01" value={weatherFormData.pressure}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, pressure: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="w-precip">Precipitación (mm)</label>
                      <input id="w-precip" type="number" step="0.01" min="0" value={weatherFormData.precipitation}
                        onChange={(e) => setWeatherFormData({ ...weatherFormData, precipitation: e.target.value })} />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    {weatherEditingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </form>
              )}
            </section>

            <section className="admin-history-section">
              <div className="history-header">
                <h2>Histórico Meteorológico</h2>
                <button onClick={loadWeatherHistory} disabled={weatherLoading}>
                  {weatherLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Máx</th><th>Temp. Mín</th>
                    <th>Humedad</th><th>Presión</th><th>Precipitación</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {weatherHistory.length > 0 ? weatherHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{item.temperature_max}°C</td>
                      <td>{item.temperature_min}°C</td>
                      <td>{item.humidity}%</td>
                      <td>{item.pressure} hPa</td>
                      <td>{item.precipitation} mm</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setWeatherEditingId(item.id);
                          setWeatherFormData({
                            temperature_max: item.temperature_max.toString(),
                            temperature_min: item.temperature_min.toString(),
                            humidity: item.humidity.toString(),
                            pressure: item.pressure.toString(),
                            precipitation: item.precipitation.toString(),
                            recorded_date: item.recorded_date,
                          });
                          setShowWeatherForm(true);
                        }}>Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handleWeatherDelete(item.id)}>Eliminar</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>No hay datos disponibles</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}

        {/* ─── River Tab ───────────────────────────────────────────────── */}
        {activeTab === 'river' && (
          <>
            <section className="admin-form-section">
              <button className="btn-primary" onClick={() => setShowRiverForm(!showRiverForm)}>
                {showRiverForm ? 'Cancelar' : 'Agregar Registro Río'}
              </button>

              {showRiverForm && (
                <form onSubmit={handleRiverSubmit} className="weather-form">
                  <h2>{riverEditingId ? 'Editar Registro' : 'Nuevo Registro Río'}</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="r-date">Fecha</label>
                      <input id="r-date" type="date" value={riverFormData.recorded_date}
                        onChange={(e) => setRiverFormData({ ...riverFormData, recorded_date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="r-temp">Temperatura del Agua (°C)</label>
                      <input id="r-temp" type="number" step="0.1" value={riverFormData.temperature}
                        onChange={(e) => setRiverFormData({ ...riverFormData, temperature: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    {riverEditingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </form>
              )}
            </section>

            <section className="admin-history-section">
              <div className="history-header">
                <h2>Histórico del Río</h2>
                <button onClick={loadRiverHistory} disabled={riverLoading}>
                  {riverLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temperatura del Agua</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {riverHistory.length > 0 ? riverHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{parseFloat(item.temperature as unknown as string).toFixed(2)}°C</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setRiverEditingId(item.id);
                          setRiverFormData({
                            temperature: item.temperature.toString(),
                            recorded_date: item.recorded_date,
                          });
                          setShowRiverForm(true);
                        }}>Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handleRiverDelete(item.id)}>Eliminar</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '20px' }}>No hay datos disponibles</td></tr>
                  )}
                </tbody>
              </table>
            </section>
          </>
        )}

      </main>
    </div>
  );
};
