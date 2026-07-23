import { FC } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface PrecipitationChartProps {
  data: WeatherData[];
  loading: boolean;
}

export const PrecipitationChart: FC<PrecipitationChartProps> = ({ data, loading }) => {
  if (loading) {
    return <div className="chart-container"><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container"><p>Sin datos</p></div>;
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
    <div className="chart-container precipitation-chart">
      <h3>🌧️ Precipitación (30 días)</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #ccc' }}
            formatter={(value) => `${value.toFixed(1)} mm`}
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
