import { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface PrecipitationChartProps {
  data: WeatherData[];
  loading: boolean;
  height?: number;
}

export const PrecipitationChart: FC<PrecipitationChartProps> = ({ data, loading, height = 180 }) => {
  if (loading) {
    return <div className="chart-container" style={{ height }}><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container" style={{ height }}><p>Sin datos</p></div>;
  }

  const chartData = data.map((item) => {
    const precipValue = typeof item.precipitation === 'string' ? parseFloat(item.precipitation) : item.precipitation;
    return {
      date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      precipitation: precipValue,
    };
  });

  return (
    <div className="chart-container precipitation-chart" style={{ height: '100%', minHeight: height }}>
      <h3>🌧️ Precipitación (30 días)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            label={{ 
              value: 'mm', 
              angle: -90, 
              position: 'insideLeft', 
              offset: 10, 
              fontSize: 11, 
              fill: 'rgba(255,255,255,0.7)' 
            }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(30,30,30,0.95)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value) => [`${(typeof value === 'number' ? value : parseFloat(value as string)).toFixed(1)} mm`, 'Precipitación']}
          />
          <Bar 
            dataKey="precipitation" 
            fill="#6C5CE7"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
