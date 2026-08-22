import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface HumidityChartProps {
  data: WeatherData[];
  loading: boolean;
}

export const HumidityChart: FC<HumidityChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-container"><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container"><p>Sin datos</p></div>;
  }

  const chartData = data.map((item) => {
    const humidityValue = typeof item.humidity === 'string' ? parseFloat(item.humidity) : item.humidity;
    return {
      date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      humidity: humidityValue,
    };
  });

  return (
    <div className="chart-container humidity-chart">
      <h3>💧 Humedad (30 días)</h3>
      <ResponsiveContainer width="100%" height={180}>
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fontSize: 11 }} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, fontSize: 12, fill: '#666' }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => `${value}%`}
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#4ECDC4" 
            dot={false} 
            strokeWidth={2}
            fill="#4ECDC4"
            fillOpacity={0.1}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
