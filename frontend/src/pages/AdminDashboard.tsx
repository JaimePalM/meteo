import { FC, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminApi, WeatherData, RiverData, CentinelasData, POMData } from '../services/api';

export const AdminDashboard: FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'weather' | 'river' | 'centinelas' | 'pom'>('weather');

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
    calidad_biologica: 'Buena',
    estado_rio: 'Bueno',
    bosque_rivera: 'Bueno',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  const CALIDAD_BIOLOGICA_OPTIONS = ['Muy buena', 'Buena', 'Regular', 'Deficiente'];
  const ESTADO_RIO_OPTIONS = ['Muy bueno', 'Bueno', 'Regular', 'Deficiente'];
  const BOSQUE_RIVERA_OPTIONS = ['Muy bueno', 'Bueno', 'Regular', 'Deficiente'];

  // ─── Centinelas state ─────────────────────────────────────────────────────
  const [centinelasHistory, setCentinelasHistory] = useState<CentinelasData[]>([]);
  const [centinelasLoading, setCentinelasLoading] = useState(false);
  const [showCentinelasForm, setShowCentinelasForm] = useState(false);
  const [centinelasEditingId, setCentinelasEditingId] = useState<number | null>(null);
  const [centinelasFormData, setCentinelasFormData] = useState({
    temperatura_agua: '',
    flora_invasora: 'Ninguna',
    residuos: 'Ninguno',
    efluentes: 'Ninguno',
    mortandades: 'Ninguna',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  const FLORA_INVASORA_OPTIONS = ['Ninguna', 'Poca', 'Moderada', 'Mucha'];
  const RESIDUOS_OPTIONS = ['Ninguno', 'Pocos', 'Moderados', 'Muchos'];
  const EFLUENTES_OPTIONS = ['Ninguno', 'Leves', 'Moderados', 'Severos'];
  const MORTANDADES_OPTIONS = ['Ninguna', 'Baja', 'Media', 'Alta'];

  // ─── POM state ────────────────────────────────────────────────────────────
  const [pomHistory, setPOMHistory] = useState<POMData[]>([]);
  const [pomLoading, setPOMLoading] = useState(false);
  const [showPOMForm, setShowPOMForm] = useState(false);
  const [pomEditingId, setPOMEditingId] = useState<number | null>(null);
  const [pomFormData, setPOMFormData] = useState({
    temperatura_mar: '',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    loadWeatherHistory();
    loadRiverHistory();
    loadCentinelasHistory();
    loadPOMHistory();
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
      calidad_biologica: riverFormData.calidad_biologica,
      estado_rio: riverFormData.estado_rio,
      bosque_rivera: riverFormData.bosque_rivera,
      recorded_date: riverFormData.recorded_date,
    };
    if (isNaN(data.temperature)) { alert('Temperatura inválida'); return; }
    try {
      if (riverEditingId) {
        await adminApi.updateRiver(riverEditingId, data);
      } else {
        await adminApi.createRiver(data);
      }
      setRiverFormData({ temperature: '', calidad_biologica: 'Buena', estado_rio: 'Bueno', bosque_rivera: 'Bueno', recorded_date: new Date().toISOString().split('T')[0] });
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

  // ─── Centinelas handlers ──────────────────────────────────────────────────
  const loadCentinelasHistory = async () => {
    try {
      setCentinelasLoading(true);
      const response = await adminApi.getCentinelasHistory();
      let data = response.data;
      if (!Array.isArray(data)) data = data ? [data] : [];
      setCentinelasHistory(data);
    } catch (error: any) {
      alert(`Error al cargar el histórico de Centinelas: ${error.response?.data?.error || error.message}`);
    } finally {
      setCentinelasLoading(false);
    }
  };

  const handleCentinelasSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centinelasFormData.temperatura_agua || !centinelasFormData.recorded_date) {
      alert('Por favor, completa todos los campos');
      return;
    }
    const data = {
      temperatura_agua: parseFloat(centinelasFormData.temperatura_agua),
      flora_invasora: centinelasFormData.flora_invasora,
      residuos: centinelasFormData.residuos,
      efluentes: centinelasFormData.efluentes,
      mortandades: centinelasFormData.mortandades,
      recorded_date: centinelasFormData.recorded_date,
    };
    if (isNaN(data.temperatura_agua)) { alert('Temperatura agua inválida'); return; }
    try {
      if (centinelasEditingId) {
        await adminApi.updateCentinelas(centinelasEditingId, data);
      } else {
        await adminApi.createCentinelas(data);
      }
      setCentinelasFormData({ temperatura_agua: '', flora_invasora: 'Ninguna', residuos: 'Ninguno', efluentes: 'Ninguno', mortandades: 'Ninguna', recorded_date: new Date().toISOString().split('T')[0] });
      setCentinelasEditingId(null);
      setShowCentinelasForm(false);
      alert('Datos de Centinelas guardados correctamente');
      loadCentinelasHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleCentinelasDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro de Centinelas?')) return;
    try { await adminApi.deleteCentinelas(id); loadCentinelasHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  // ─── POM handlers ─────────────────────────────────────────────────────────
  const loadPOMHistory = async () => {
    try {
      setPOMLoading(true);
      const response = await adminApi.getPOMHistory();
      let data = response.data;
      if (!Array.isArray(data)) data = data ? [data] : [];
      setPOMHistory(data);
    } catch (error: any) {
      alert(`Error al cargar el histórico de POM: ${error.response?.data?.error || error.message}`);
    } finally {
      setPOMLoading(false);
    }
  };

  const handlePOMSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pomFormData.temperatura_mar || !pomFormData.recorded_date) {
      alert('Por favor, completa todos los campos');
      return;
    }
    const data = {
      temperatura_mar: parseFloat(pomFormData.temperatura_mar),
      recorded_date: pomFormData.recorded_date,
    };
    if (isNaN(data.temperatura_mar)) { alert('Temperatura mar inválida'); return; }
    try {
      if (pomEditingId) {
        await adminApi.updatePOM(pomEditingId, data);
      } else {
        await adminApi.createPOM(data);
      }
      setPOMFormData({ temperatura_mar: '', recorded_date: new Date().toISOString().split('T')[0] });
      setPOMEditingId(null);
      setShowPOMForm(false);
      alert('Datos de POM guardados correctamente');
      loadPOMHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handlePOMDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro de POM?')) return;
    try { await adminApi.deletePOM(id); loadPOMHistory(); }
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
        <button
          className={`admin-tab ${activeTab === 'centinelas' ? 'active' : ''}`}
          onClick={() => setActiveTab('centinelas')}
        >
          🛰️ Centinelas
        </button>
        <button
          className={`admin-tab ${activeTab === 'pom' ? 'active' : ''}`}
          onClick={() => setActiveTab('pom')}
        >
          📋 POM
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
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="r-calidad">Calidad biológica del agua</label>
                      <select id="r-calidad" value={riverFormData.calidad_biologica}
                        onChange={(e) => setRiverFormData({ ...riverFormData, calidad_biologica: e.target.value })} required>
                        {CALIDAD_BIOLOGICA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="r-estado">Estado del río</label>
                      <select id="r-estado" value={riverFormData.estado_rio}
                        onChange={(e) => setRiverFormData({ ...riverFormData, estado_rio: e.target.value })} required>
                        {ESTADO_RIO_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="r-bosque">Bosque de rivera</label>
                      <select id="r-bosque" value={riverFormData.bosque_rivera}
                        onChange={(e) => setRiverFormData({ ...riverFormData, bosque_rivera: e.target.value })} required>
                        {BOSQUE_RIVERA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
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
                            calidad_biologica: item.calidad_biologica || 'Buena',
                            estado_rio: item.estado_rio || 'Bueno',
                            bosque_rivera: item.bosque_rivera || 'Bueno',
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

        {/* ─── Centinelas Tab ───────────────────────────────────────────── */}
        {activeTab === 'centinelas' && (
          <>
            <section className="admin-form-section">
              <button className="btn-primary" onClick={() => setShowCentinelasForm(!showCentinelasForm)}>
                {showCentinelasForm ? 'Cancelar' : 'Agregar Registro Centinelas'}
              </button>

              {showCentinelasForm && (
                <form onSubmit={handleCentinelasSubmit} className="weather-form">
                  <h2>{centinelasEditingId ? 'Editar Registro' : 'Nuevo Registro Centinelas'}</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="c-date">Fecha</label>
                      <input id="c-date" type="date" value={centinelasFormData.recorded_date}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, recorded_date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="c-temp">Temperatura Agua (°C)</label>
                      <input id="c-temp" type="number" step="0.1" value={centinelasFormData.temperatura_agua}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, temperatura_agua: e.target.value })} required />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="c-flora">Flora invasora</label>
                      <select id="c-flora" value={centinelasFormData.flora_invasora}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, flora_invasora: e.target.value })} required>
                        {FLORA_INVASORA_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="c-residuos">Residuos</label>
                      <select id="c-residuos" value={centinelasFormData.residuos}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, residuos: e.target.value })} required>
                        {RESIDUOS_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label htmlFor="c-efluentes">Efluentes</label>
                      <select id="c-efluentes" value={centinelasFormData.efluentes}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, efluentes: e.target.value })} required>
                        {EFLUENTES_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="c-mortandades">Mortandades</label>
                      <select id="c-mortandades" value={centinelasFormData.mortandades}
                        onChange={(e) => setCentinelasFormData({ ...centinelasFormData, mortandades: e.target.value })} required>
                        {MORTANDADES_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    {centinelasEditingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </form>
              )}
            </section>

            <section className="admin-history-section">
              <div className="history-header">
                <h2>Histórico de Centinelas</h2>
                <button onClick={loadCentinelasHistory} disabled={centinelasLoading}>
                  {centinelasLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Agua</th><th>Flora Invasora</th>
                    <th>Residuos</th><th>Efluentes</th><th>Mortandades</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {centinelasHistory.length > 0 ? centinelasHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{parseFloat(item.temperatura_agua as unknown as string).toFixed(2)}°C</td>
                      <td>{item.flora_invasora}</td>
                      <td>{item.residuos}</td>
                      <td>{item.efluentes}</td>
                      <td>{item.mortandades}</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setCentinelasEditingId(item.id);
                          setCentinelasFormData({
                            temperatura_agua: item.temperatura_agua.toString(),
                            flora_invasora: item.flora_invasora,
                            residuos: item.residuos,
                            efluentes: item.efluentes,
                            mortandades: item.mortandades,
                            recorded_date: item.recorded_date,
                          });
                          setShowCentinelasForm(true);
                        }}>Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handleCentinelasDelete(item.id)}>Eliminar</button>
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

        {/* ─── POM Tab ──────────────────────────────────────────────────── */}
        {activeTab === 'pom' && (
          <>
            <section className="admin-form-section">
              <button className="btn-primary" onClick={() => setShowPOMForm(!showPOMForm)}>
                {showPOMForm ? 'Cancelar' : 'Agregar Registro POM'}
              </button>

              {showPOMForm && (
                <form onSubmit={handlePOMSubmit} className="weather-form">
                  <h2>{pomEditingId ? 'Editar Registro' : 'Nuevo Registro POM'}</h2>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="p-date">Fecha</label>
                      <input id="p-date" type="date" value={pomFormData.recorded_date}
                        onChange={(e) => setPOMFormData({ ...pomFormData, recorded_date: e.target.value })} required />
                    </div>
                    <div className="form-group">
                      <label htmlFor="p-temp">Temperatura Mar (°C)</label>
                      <input id="p-temp" type="number" step="0.1" value={pomFormData.temperatura_mar}
                        onChange={(e) => setPOMFormData({ ...pomFormData, temperatura_mar: e.target.value })} required />
                    </div>
                  </div>
                  <button type="submit" className="btn-primary">
                    {pomEditingId ? 'Actualizar' : 'Guardar'}
                  </button>
                </form>
              )}
            </section>

            <section className="admin-history-section">
              <div className="history-header">
                <h2>Histórico POM - Temperatura Mar</h2>
                <button onClick={loadPOMHistory} disabled={pomLoading}>
                  {pomLoading ? 'Cargando...' : 'Recargar'}
                </button>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Mar (°C)</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {pomHistory.length > 0 ? pomHistory.map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{parseFloat(item.temperatura_mar as unknown as string).toFixed(2)}°C</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setPOMEditingId(item.id);
                          setPOMFormData({
                            temperatura_mar: item.temperatura_mar.toString(),
                            recorded_date: item.recorded_date,
                          });
                          setShowPOMForm(true);
                        }}>Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handlePOMDelete(item.id)}>Eliminar</button>
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