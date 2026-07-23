import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface TemperatureChartProps {
  data: WeatherData[];
  loading: boolean;
}

export const TemperatureChart: FC<TemperatureChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-container"><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container"><p>Sin datos</p></div>;
  }

  const chartData = data.map((item) => {
    const maxTemp = typeof item.temperature_max === 'string' ? parseFloat(item.temperature_max) : item.temperature_max;
    const minTemp = typeof item.temperature_min === 'string' ? parseFloat(item.temperature_min) : item.temperature_min;
    return {
      date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      temp_max: maxTemp,
      temp_min: minTemp,
      temp_avg: (maxTemp + minTemp) / 2,
    };
  });

  return (
    <div className="chart-container temperature-chart">
      <h3>📊 Temperatura (30 días)</h3>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fontSize: 11 }} label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 5 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => `${(typeof value === 'number' ? value : parseFloat(value as string)).toFixed(1)}°C`}
          />
          <Line 
            type="monotone" 
            dataKey="temp_max" 
            stroke="#FF6B6B" 
            dot={false} 
            strokeWidth={2}
            name="Máx"
          />
          <Line 
            type="monotone" 
            dataKey="temp_min" 
            stroke="#4ECDC4" 
            dot={false} 
            strokeWidth={2}
            name="Mín"
          />
          <Line 
            type="monotone" 
            dataKey="temp_avg" 
            stroke="#FFD93D" 
            dot={false} 
            strokeWidth={1.5}
            strokeDasharray="5 5"
            name="Media"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
