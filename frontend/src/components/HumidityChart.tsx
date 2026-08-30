import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface HumidityChartProps {
  data: WeatherData[];
  loading: boolean;
  height?: number;
}

export const HumidityChart: FC<HumidityChartProps> = ({ data, loading, height = 300 }) => {
  if (loading) {
    return <div className="chart-container" style={{ height }}><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container" style={{ height }}><p>Sin datos</p></div>;
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
    <div className="chart-container humidity-chart" style={{ height }}>
      <h3>💧 Humedad (30 días)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 10, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
          />
          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            label={{ value: '%', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(30,30,30,0.95)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value) => [`${value}%`, 'Humedad']}
            labelFormatter={(label: string) => label}
          />
          <Line 
            type="monotone" 
            dataKey="humidity" 
            stroke="#4ECDC4" 
            dot={false} 
            strokeWidth={2.5}
            fill="#4ECDC4"
            fillOpacity={0.1}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
