import { FC } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { WeatherData } from '../services/api';

interface WeatherChartProps {
  data: WeatherData[];
  loading: boolean;
}

export const WeatherChart: FC<WeatherChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="weather-chart loading">
        <p>Cargando gráficas...</p>
      </div>
    );
  }

  // Validate that data is an array
  if (!Array.isArray(data)) {
    console.error('[WeatherChart] data is not an array:', typeof data, data);
    return (
      <div className="weather-chart error">
        <p>Error: datos inválidos (no es un array)</p>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="weather-chart error">
        <p>No hay datos para mostrar</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
      month: 'short',
      day: 'numeric',
    }),
    temp_max: item.temperature_max,
    temp_min: item.temperature_min,
    humidity: item.humidity,
    pressure: item.pressure,
    precipitation: item.precipitation,
  }));

  return (
    <div className="weather-chart">
      <h2>Histórico (Últimos 30 días)</h2>
      
      <div className="chart-container">
        <div className="chart-item">
          <h3>Temperatura</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="temp_max" stroke="#ef4444" name="Máxima" />
              <Line type="monotone" dataKey="temp_min" stroke="#3b82f6" name="Mínima" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Precipitación</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="precipitation" fill="#8b5cf6" name="Precipitación (mm)" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-item">
          <h3>Humedad y Presión</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis yAxisId="left" />
              <YAxis yAxisId="right" orientation="right" />
              <Tooltip />
              <Legend />
              <Area
                yAxisId="left"
                type="monotone"
                dataKey="humidity"
                fill="#fbbf24"
                stroke="#f59e0b"
                name="Humedad (%)"
              />
              <Area
                yAxisId="right"
                type="monotone"
                dataKey="pressure"
                fill="#10b981"
                stroke="#059669"
                name="Presión (hPa)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
