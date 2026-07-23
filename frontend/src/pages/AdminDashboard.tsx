import { FC, useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { adminApi, WeatherData } from '../services/api';

export const AdminDashboard: FC = () => {
  const { logout } = useAuth();
  const [weatherHistory, setWeatherHistory] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    temperature_max: '',
    temperature_min: '',
    humidity: '',
    pressure: '',
    precipitation: '',
    recorded_date: new Date().toISOString().split('T')[0],
  });

  // Load history on component mount
  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      console.log('[AdminDashboard] Token disponible:', !!token);
      console.log('[AdminDashboard] Calling adminApi.getWeatherHistory()...');
      const response = await adminApi.getWeatherHistory();
      
      console.log('[AdminDashboard] Response status:', response.status);
      console.log('[AdminDashboard] Response headers:', response.headers);
      console.log('[AdminDashboard] response.data type:', typeof response.data);
      console.log('[AdminDashboard] response.data (first 200 chars):', String(response.data).slice(0, 200));
      
      // Ensure data is an array - handle case where it comes as a string
      let historyData = response.data;
      
      // If it's a string, parse it as JSON
      if (typeof historyData === 'string') {
        console.log('[AdminDashboard] response.data is a string, parsing...');
        try {
          historyData = JSON.parse(historyData);
          console.log('[AdminDashboard] Parsed successfully, type now:', typeof historyData, Array.isArray(historyData));
        } catch (e) {
          console.error('[AdminDashboard] Failed to parse JSON string:', e);
          historyData = [];
        }
      }
      
      // If still not an array, convert it
      if (!Array.isArray(historyData)) {
        console.warn('[AdminDashboard] response.data is not an array, converting...');
        // If it's an object-like with numeric keys, convert to array
        if (typeof historyData === 'object' && historyData !== null) {
          historyData = Object.values(historyData);
          console.log('[AdminDashboard] Converted to array, length:', historyData.length);
        } else {
          historyData = historyData ? [historyData] : [];
        }
      }
      
      console.log('[AdminDashboard] Final historyData length:', historyData.length);
      console.log('[AdminDashboard] First record:', historyData[0]);
      setWeatherHistory(historyData);
    } catch (error: any) {
      console.error('[AdminDashboard] Error loading history:', error);
      const errorMsg = error.response?.data?.error || error.message || 'Error desconocido';
      alert(`Error al cargar el histórico: ${errorMsg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Validate that all fields are filled
      if (!formData.temperature_max || !formData.temperature_min || !formData.humidity || !formData.pressure || !formData.recorded_date) {
        alert('Por favor, completa todos los campos');
        return;
      }

      const data = {
        temperature_max: parseFloat(formData.temperature_max),
        temperature_min: parseFloat(formData.temperature_min),
        humidity: parseInt(formData.humidity),
        pressure: parseFloat(formData.pressure),
        precipitation: parseFloat(formData.precipitation) || 0,
        recorded_date: formData.recorded_date,
      };

      // Validate ranges
      if (data.humidity < 0 || data.humidity > 100) {
        alert('La humedad debe estar entre 0 y 100');
        return;
      }

      console.log('[AdminDashboard] Enviando datos:', data);
      console.log('[AdminDashboard] editingId:', editingId);

      if (editingId) {
        console.log('[AdminDashboard] Llamando updateWeather con ID:', editingId);
        await adminApi.updateWeather(editingId, data);
      } else {
        console.log('[AdminDashboard] Llamando createWeather');
        await adminApi.createWeather(data as any);
      }

      setFormData({
        temperature_max: '',
        temperature_min: '',
        humidity: '',
        pressure: '',
        precipitation: '',
        recorded_date: new Date().toISOString().split('T')[0],
      });
      setEditingId(null);
      setShowForm(false);
      alert('Datos guardados correctamente');
      loadHistory();
    } catch (error: any) {
      console.error('[AdminDashboard] Error saving weather:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Error al guardar los datos';
      alert(errorMessage);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Está seguro de que desea eliminar este registro?')) return;

    try {
      await adminApi.deleteWeather(id);
      loadHistory();
    } catch (error) {
      console.error('Error deleting weather:', error);
      alert('Error al eliminar el registro');
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

      <main className="admin-main">
        <section className="admin-form-section">
          <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancelar' : 'Agregar Datos'}
          </button>

          {showForm && (
            <form onSubmit={handleSubmit} className="weather-form">
              <h2>{editingId ? 'Editar Registro' : 'Nuevo Registro'}</h2>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="date">Fecha</label>
                  <input
                    id="date"
                    type="date"
                    value={formData.recorded_date}
                    onChange={(e) =>
                      setFormData({ ...formData, recorded_date: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="temp_max">Temperatura Máxima (°C)</label>
                  <input
                    id="temp_max"
                    type="number"
                    step="0.1"
                    value={formData.temperature_max}
                    onChange={(e) =>
                      setFormData({ ...formData, temperature_max: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="temp_min">Temperatura Mínima (°C)</label>
                  <input
                    id="temp_min"
                    type="number"
                    step="0.1"
                    value={formData.temperature_min}
                    onChange={(e) =>
                      setFormData({ ...formData, temperature_min: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="humidity">Humedad (%)</label>
                  <input
                    id="humidity"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.humidity}
                    onChange={(e) =>
                      setFormData({ ...formData, humidity: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="pressure">Presión (hPa)</label>
                  <input
                    id="pressure"
                    type="number"
                    step="0.01"
                    value={formData.pressure}
                    onChange={(e) =>
                      setFormData({ ...formData, pressure: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="precipitation">Precipitación (mm)</label>
                  <input
                    id="precipitation"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.precipitation}
                    onChange={(e) =>
                      setFormData({ ...formData, precipitation: e.target.value })
                    }
                  />
                </div>
              </div>

              <button type="submit" className="btn-primary">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
            </form>
          )}
        </section>

        <section className="admin-history-section">
          <div className="history-header">
            <h2>Histórico de Datos</h2>
            <button onClick={loadHistory} disabled={loading}>
              {loading ? 'Cargando...' : 'Recargar'}
            </button>
          </div>

          {!Array.isArray(weatherHistory) && (
            <div style={{ color: 'red', padding: '10px' }}>
              Error: Los datos del histórico no son válidos (no es un array). Tipo recibido: {typeof weatherHistory}
            </div>
          )}

          <table className="history-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Temp. Máx</th>
                <th>Temp. Mín</th>
                <th>Humedad</th>
                <th>Presión</th>
                <th>Precipitación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(weatherHistory) && weatherHistory.length > 0 ? (
                weatherHistory.map((item) => (
                  <tr key={item.id}>
                    <td>{new Date(item.recorded_date).toLocaleDateString('es-ES')}</td>
                    <td>{item.temperature_max}°C</td>
                    <td>{item.temperature_min}°C</td>
                    <td>{item.humidity}%</td>
                    <td>{item.pressure} hPa</td>
                    <td>{item.precipitation} mm</td>
                    <td>
                      <button
                        className="btn-small"
                        onClick={() => {
                          setEditingId(item.id);
                          setFormData({
                            temperature_max: item.temperature_max.toString(),
                            temperature_min: item.temperature_min.toString(),
                            humidity: item.humidity.toString(),
                            pressure: item.pressure.toString(),
                            precipitation: item.precipitation.toString(),
                            recorded_date: item.recorded_date,
                          });
                          setShowForm(true);
                        }}
                      >
                        Editar
                      </button>
                      <button className="btn-small btn-danger" onClick={() => handleDelete(item.id)}>
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '20px' }}>
                    No hay datos disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
};
