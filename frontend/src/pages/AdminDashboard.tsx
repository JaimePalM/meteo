import { FC, useState, useEffect, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminApi, CarouselSettings, WeatherData, RiverData, CentinelasData, POMData } from '../services/api';

function filterByDate<T extends { recorded_date: string }>(records: T[], date: string): T[] {
  return date ? records.filter((record) => record.recorded_date.slice(0, 10) === date) : records;
}

export const AdminDashboard: FC = () => {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'weather' | 'river' | 'centinelas' | 'pom' | 'carousel'>('weather');
  const [historyDateFilter, setHistoryDateFilter] = useState('');
  const [notice, setNotice] = useState<string | null>(null);
  const [carouselSettings, setCarouselSettings] = useState<CarouselSettings>({ intervalMs: 10000, showIndicators: true, backgrounds: {}, images: [] });
  const [carouselImages, setCarouselImages] = useState<Array<{ panel_id: string; content_type: string; updated_at: string }>>([]);
  const [carouselSaving, setCarouselSaving] = useState(false);
  const adminMainRef = useRef<HTMLElement>(null);

  const editableSlides = [
    ['panel-1', '1 · Logo Meteoescuela'], ['panel-6', '6 · Centinelas'], ['panel-7', '7 · Centinelas'], ['panel-8', '8 · Centinelas'],
    ['panel-9', '9 · Centinelas'], ['panel-10', '10 · Centinelas'], ['panel-11', '11 · Centinelas'], ['panel-12', '12 · Centinelas'],
    ['panel-14', '14 · POM'], ['panel-15', '15 · POM'], ['panel-18', '18 · Ríos'], ['panel-20', '20 · Ríos'],
  ] as const;
  const slideLabels = [
    '1 · Portada Meteoescuela', '2 · Logos meteorológicos', '3 · Datos meteorológicos', '4 · Gráfica de temperatura', '5 · Gráfica de precipitación',
    '6 · Centinelas', '7 · Centinelas', '8 · Centinelas', '9 · Centinelas', '10 · Centinelas', '11 · Centinelas', '12 · Centinelas', '13 · Datos Centinelas',
    '14 · POM', '15 · POM', '16 · Datos POM', '17 · Logos Ríos', '18 · Ríos', '19 · Datos Ríos', '20 · Ríos',
  ];

  const notify = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(null), 4000);
  };

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
    loadCarouselConfig();
  }, []);

  useEffect(() => {
    if (!weatherEditingId && !riverEditingId && !centinelasEditingId && !pomEditingId) return;
    window.requestAnimationFrame(() => {
      adminMainRef.current?.querySelector('.weather-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, [weatherEditingId, riverEditingId, centinelasEditingId, pomEditingId]);

  const loadCarouselConfig = async () => {
    try {
      const [settings, images] = await Promise.all([adminApi.getCarouselSettings(), adminApi.getCarouselImages()]);
      setCarouselSettings({ ...settings.data, backgrounds: settings.data.backgrounds ?? {} });
      setCarouselImages(images.data);
    } catch (error: any) {
      alert(`Error al cargar la configuración del carrusel: ${error.response?.data?.error || error.message}`);
    }
  };

  const saveCarouselSettings = async (event?: React.FormEvent) => {
    event?.preventDefault();
    try {
      setCarouselSaving(true);
      await adminApi.updateCarouselSettings({ intervalMs: carouselSettings.intervalMs, showIndicators: carouselSettings.showIndicators, backgrounds: carouselSettings.backgrounds });
      notify('Configuración del carrusel guardada. Se aplicará en el monitor en menos de 15 segundos.');
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se pudo guardar la configuración del carrusel');
    } finally {
      setCarouselSaving(false);
    }
  };

  const uploadCarouselImage = async (panelId: string, file?: File) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Selecciona una imagen JPEG, PNG o WebP.');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no puede superar 8 MB.');
      return;
    }
    try {
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result).split(',')[1]);
        reader.onerror = () => reject(new Error('No se ha podido leer la imagen'));
        reader.readAsDataURL(file);
      });
      await adminApi.uploadCarouselImage(panelId, imageData, file.type);
      notify('Imagen actualizada. Se verá en el monitor en menos de 15 segundos.');
      loadCarouselConfig();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'No se ha podido subir la imagen');
    }
  };

  const updateSlideBackground = (panelId: string, color: string) => {
    setCarouselSettings({ ...carouselSettings, backgrounds: { ...carouselSettings.backgrounds, [panelId]: color } });
  };

  const resetSlideBackground = (panelId: string) => {
    const { [panelId]: _removed, ...backgrounds } = carouselSettings.backgrounds;
    setCarouselSettings({ ...carouselSettings, backgrounds });
  };

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
      notify('Registro meteorológico guardado correctamente.');
      loadWeatherHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleWeatherDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro?')) return;
    try { await adminApi.deleteWeather(id); notify('Registro meteorológico eliminado.'); loadWeatherHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  const confirmDeleteAll = (label: string) => {
    if (!window.confirm(`Se eliminarán todos los registros de ${label}. Esta acción no se puede deshacer. ¿Quieres continuar?`)) return false;
    if (window.prompt(`Segunda confirmación: escribe BORRAR para eliminar todo el histórico de ${label}.`) !== 'BORRAR') {
      alert('El histórico no se ha eliminado.');
      return false;
    }
    return true;
  };

  const handleDeleteAllWeather = async () => {
    if (!confirmDeleteAll('Meteorología')) return;
    try {
      const response = await adminApi.deleteAllWeather();
      setWeatherHistory([]);
      setShowWeatherForm(false);
      setWeatherEditingId(null);
      notify(`Se han eliminado ${response.data.deleted} registros meteorológicos.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se ha podido eliminar el histórico meteorológico.');
    }
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
    if (![5, 10].includes(Number(riverFormData.recorded_date.slice(5, 7)))) {
      alert('Los datos de río solo se registran en mayo u octubre.');
      return;
    }
    try {
      if (riverEditingId) {
        await adminApi.updateRiver(riverEditingId, data);
      } else {
        await adminApi.createRiver(data);
      }
      setRiverFormData({ temperature: '', calidad_biologica: 'Buena', estado_rio: 'Bueno', bosque_rivera: 'Bueno', recorded_date: new Date().toISOString().split('T')[0] });
      setRiverEditingId(null);
      setShowRiverForm(false);
      notify('Registro del río guardado correctamente.');
      loadRiverHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleRiverDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro del río?')) return;
    try { await adminApi.deleteRiver(id); notify('Registro del río eliminado.'); loadRiverHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  const handleDeleteAllRiver = async () => {
    if (!confirmDeleteAll('Ríos')) return;
    try {
      const response = await adminApi.deleteAllRiver();
      setRiverHistory([]);
      setShowRiverForm(false);
      setRiverEditingId(null);
      notify(`Se han eliminado ${response.data.deleted} registros de Ríos.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se ha podido eliminar el histórico de Ríos.');
    }
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
      notify('Registro de Centinelas guardado correctamente.');
      loadCentinelasHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handleCentinelasDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro de Centinelas?')) return;
    try { await adminApi.deleteCentinelas(id); notify('Registro de Centinelas eliminado.'); loadCentinelasHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  const handleDeleteAllCentinelas = async () => {
    if (!confirmDeleteAll('Centinelas')) return;
    try {
      const response = await adminApi.deleteAllCentinelas();
      setCentinelasHistory([]);
      setShowCentinelasForm(false);
      setCentinelasEditingId(null);
      notify(`Se han eliminado ${response.data.deleted} registros de Centinelas.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se ha podido eliminar el histórico de Centinelas.');
    }
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
      notify('Registro POM guardado correctamente.');
      loadPOMHistory();
    } catch (error: any) {
      alert(error.response?.data?.error || error.message || 'Error al guardar los datos');
    }
  };

  const handlePOMDelete = async (id: number) => {
    if (!confirm('¿Eliminar este registro de POM?')) return;
    try { await adminApi.deletePOM(id); notify('Registro POM eliminado.'); loadPOMHistory(); }
    catch { alert('Error al eliminar el registro'); }
  };

  const handleDeleteAllPOM = async () => {
    if (!confirmDeleteAll('POM')) return;
    try {
      const response = await adminApi.deleteAllPOM();
      setPOMHistory([]);
      setShowPOMForm(false);
      setPOMEditingId(null);
      notify(`Se han eliminado ${response.data.deleted} registros POM.`);
    } catch (error: any) {
      alert(error.response?.data?.error || 'No se ha podido eliminar el histórico POM.');
    }
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
        <button className={`admin-tab ${activeTab === 'carousel' ? 'active' : ''}`} onClick={() => setActiveTab('carousel')}>
          🖼️ Carrusel
        </button>
      </div>

      <main className="admin-main" ref={adminMainRef}>
        {notice && <div className="admin-notice" role="status">{notice}</div>}

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
                <div className="history-actions">
                  <label className="history-filter">Fecha <input type="date" value={historyDateFilter} onChange={(event) => setHistoryDateFilter(event.target.value)} /></label>
                  <button onClick={loadWeatherHistory} disabled={weatherLoading}>{weatherLoading ? 'Cargando...' : 'Recargar'}</button>
                  <button className="btn-danger-history" onClick={handleDeleteAllWeather} disabled={weatherLoading || weatherHistory.length === 0}>Eliminar todo</button>
                </div>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Máx</th><th>Temp. Mín</th>
                    <th>Humedad</th><th>Presión</th><th>Precipitación</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(weatherHistory, historyDateFilter).length > 0 ? filterByDate(weatherHistory, historyDateFilter).map((item) => (
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
                            recorded_date: item.recorded_date.slice(0, 10),
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
                  <p className="form-help">Cada curso escolar admite una medición en mayo y otra en octubre.</p>
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
                <div className="history-actions">
                  <label className="history-filter">Fecha <input type="date" value={historyDateFilter} onChange={(event) => setHistoryDateFilter(event.target.value)} /></label>
                  <button onClick={loadRiverHistory} disabled={riverLoading}>{riverLoading ? 'Cargando...' : 'Recargar'}</button>
                  <button className="btn-danger-history" onClick={handleDeleteAllRiver} disabled={riverLoading || riverHistory.length === 0}>Eliminar todo</button>
                </div>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temperatura</th><th>Calidad biológica</th><th>Estado del río</th><th>Bosque de ribera</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(riverHistory, historyDateFilter).length > 0 ? filterByDate(riverHistory, historyDateFilter).map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{parseFloat(item.temperature as unknown as string).toFixed(2)}°C</td>
                      <td>{item.calidad_biologica || 'Buena'}</td>
                      <td>{item.estado_rio || 'Bueno'}</td>
                      <td>{item.bosque_rivera || 'Bueno'}</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setRiverEditingId(item.id);
                          setRiverFormData({
                            temperature: item.temperature.toString(),
                            calidad_biologica: item.calidad_biologica || 'Buena',
                            estado_rio: item.estado_rio || 'Bueno',
                            bosque_rivera: item.bosque_rivera || 'Bueno',
                            recorded_date: item.recorded_date.slice(0, 10),
                          });
                          setShowRiverForm(true);
                        }}>Editar</button>
                        <button className="btn-small btn-danger" onClick={() => handleRiverDelete(item.id)}>Eliminar</button>
                      </td>
                    </tr>
                  )) : (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '20px' }}>No hay datos disponibles</td></tr>
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
                  <p className="form-help">Cada curso escolar admite una única observación de Centinelas.</p>
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
                <div className="history-actions">
                  <label className="history-filter">Fecha <input type="date" value={historyDateFilter} onChange={(event) => setHistoryDateFilter(event.target.value)} /></label>
                  <button onClick={loadCentinelasHistory} disabled={centinelasLoading}>{centinelasLoading ? 'Cargando...' : 'Recargar'}</button>
                  <button className="btn-danger-history" onClick={handleDeleteAllCentinelas} disabled={centinelasLoading || centinelasHistory.length === 0}>Eliminar todo</button>
                </div>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Agua</th><th>Flora Invasora</th>
                    <th>Residuos</th><th>Efluentes</th><th>Mortandades</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(centinelasHistory, historyDateFilter).length > 0 ? filterByDate(centinelasHistory, historyDateFilter).map((item) => (
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
                            recorded_date: item.recorded_date.slice(0, 10),
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
                  <p className="form-help">Solo se admite una temperatura del mar por cada mes.</p>
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
                <div className="history-actions">
                  <label className="history-filter">Fecha <input type="date" value={historyDateFilter} onChange={(event) => setHistoryDateFilter(event.target.value)} /></label>
                  <button onClick={loadPOMHistory} disabled={pomLoading}>{pomLoading ? 'Cargando...' : 'Recargar'}</button>
                  <button className="btn-danger-history" onClick={handleDeleteAllPOM} disabled={pomLoading || pomHistory.length === 0}>Eliminar todo</button>
                </div>
              </div>
              <table className="history-table">
                <thead>
                  <tr>
                    <th>Fecha</th><th>Temp. Mar (°C)</th><th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filterByDate(pomHistory, historyDateFilter).length > 0 ? filterByDate(pomHistory, historyDateFilter).map((item) => (
                    <tr key={item.id}>
                      <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                      <td>{parseFloat(item.temperatura_mar as unknown as string).toFixed(2)}°C</td>
                      <td>
                        <button className="btn-small" onClick={() => {
                          setPOMEditingId(item.id);
                          setPOMFormData({
                            temperatura_mar: item.temperatura_mar.toString(),
                            recorded_date: item.recorded_date.slice(0, 10),
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

        {activeTab === 'carousel' && (
          <>
            <section className="admin-form-section">
              <form onSubmit={saveCarouselSettings} className="carousel-settings-form">
                <div>
                  <h2>Comportamiento del carrusel</h2>
                  <p className="form-help">El cambio se aplicará automáticamente en las pantallas abiertas en menos de 15 segundos.</p>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="carousel-interval">Intervalo entre diapositivas (segundos)</label>
                    <input id="carousel-interval" type="number" min="0" max="3600" step="1" value={carouselSettings.intervalMs / 1000}
                      onChange={(event) => setCarouselSettings({ ...carouselSettings, intervalMs: Math.max(0, Number(event.target.value) * 1000) })} />
                    <span className="form-help">Usa 0 para desactivar el avance automático.</span>
                  </div>
                  <label className="toggle-field"><input type="checkbox" checked={carouselSettings.intervalMs === 0 || carouselSettings.showIndicators}
                    disabled={carouselSettings.intervalMs === 0}
                    onChange={(event) => setCarouselSettings({ ...carouselSettings, showIndicators: event.target.checked })} /> Mostrar los botones de diapositiva
                    {carouselSettings.intervalMs === 0 && <small>Obligatorios cuando no hay avance automático.</small>}</label>
                </div>
                <button type="submit" className="btn-primary" disabled={carouselSaving}>{carouselSaving ? 'Guardando…' : 'Guardar configuración'}</button>
              </form>
            </section>

            <section className="admin-history-section">
              <div className="history-header"><div><h2>Imágenes de diapositivas</h2><p className="form-help">Solo se muestran las diapositivas que contienen una única imagen. JPEG, PNG o WebP hasta 8 MB.</p></div></div>
              <div className="carousel-image-list">
                {editableSlides.map(([panelId, label]) => {
                  const image = carouselImages.find((item) => item.panel_id === panelId);
                  return <label key={panelId} className="carousel-image-item">
                    <span><strong>{label}</strong><small>{image ? `Personalizada · ${new Date(image.updated_at).toLocaleDateString('es-ES')}` : 'Imagen predeterminada'}</small></span>
                    <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => uploadCarouselImage(panelId, event.target.files?.[0])} />
                  </label>;
                })}
              </div>
            </section>

            <section className="admin-history-section">
              <div className="history-header"><div><h2>Color de fondo por diapositiva</h2><p className="form-help">El color se aplica al fondo completo de la diapositiva. Restablecer conserva el diseño original.</p></div></div>
              <div className="slide-background-list">
                {slideLabels.map((label, index) => {
                  const panelId = `panel-${index + 1}`;
                  const color = carouselSettings.backgrounds[panelId] ?? '#ffffff';
                  const configured = Boolean(carouselSettings.backgrounds[panelId]);
                  return <div key={panelId} className="slide-background-item">
                    <label htmlFor={`background-${panelId}`}>{label}</label>
                    <div className="slide-background-actions">
                      <input id={`background-${panelId}`} type="color" value={color} onChange={(event) => updateSlideBackground(panelId, event.target.value)} aria-label={`Color de fondo para ${label}`} />
                      <span>{configured ? color.toUpperCase() : 'Original'}</span>
                      <button type="button" onClick={() => resetSlideBackground(panelId)} disabled={!configured}>Restablecer</button>
                    </div>
                  </div>;
                })}
              </div>
              <button type="button" className="btn-primary" onClick={() => saveCarouselSettings()} disabled={carouselSaving}>{carouselSaving ? 'Guardando…' : 'Guardar colores de fondo'}</button>
            </section>
          </>
        )}

      </main>
    </div>
  );
};
