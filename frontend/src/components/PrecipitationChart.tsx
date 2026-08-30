import { FC } from 'react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WeatherData } from '../services/api';
import { formatChartDate, toFiniteNumber, uniqueDailyRecords } from '../utils/chartUtils';

interface PrecipitationChartProps {
  data: WeatherData[];
  loading: boolean;
  height?: number;
}

export const PrecipitationChart: FC<PrecipitationChartProps> = ({ data, loading, height = 400 }) => {
  if (loading) return <div className="chart-container" style={{ height }}><p>Cargando...</p></div>;
  if (!Array.isArray(data) || data.length === 0) return <div className="chart-container" style={{ height }}><p>Sin datos</p></div>;

  const chartData = uniqueDailyRecords(data)
    .map((item) => ({
      date: formatChartDate(item.recorded_date, { month: 'short', day: 'numeric' }),
      precipitation: toFiniteNumber(item.precipitation),
    }))
    .filter((item) => item.precipitation !== null);

  if (chartData.length === 0) return <div className="chart-container" style={{ height }}><p>Sin valores válidos para representar</p></div>;

  return (
    <div className="chart-container precipitation-chart" style={{ minHeight: height }}>
      <h3>Precipitación acumulada · últimos 30 días</h3>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#dce4ea" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" minTickGap={24} tick={{ fontSize: 11, fill: '#536471' }} tickLine={false} axisLine={{ stroke: '#cbd5df' }} />
            <YAxis tick={{ fontSize: 11, fill: '#536471' }} tickFormatter={(value) => `${value} mm`} tickLine={false} axisLine={false} width={54} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #d5dee5', borderRadius: '8px', color: '#1f2d38' }}
              labelStyle={{ color: '#536471', fontWeight: 600 }}
              formatter={(value) => [`${Number(value).toFixed(1)} mm`, 'Precipitación']}
            />
            <Bar dataKey="precipitation" fill="#437bc0" radius={[4, 4, 0, 0]} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
