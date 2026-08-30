import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { RiverData } from '../services/api';

interface RiverTemperatureChartProps {
  data: RiverData[];
  loading: boolean;
  height?: number;
}

export const RiverTemperatureChart: FC<RiverTemperatureChartProps> = ({ data, loading, height = 300 }) => {
  if (loading) {
    return (
      <div className="chart-container" style={{ height }}>
        <p>Cargando...</p>
      </div>
    );
  }

  const chartData = data.map((item) => ({
    date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    }),
    temperatura: parseFloat(item.temperature as unknown as string),
  }));

  return (
    <div className="chart-container" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
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
            label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
            labelFormatter={(label: string) => label}
            contentStyle={{ 
              backgroundColor: 'rgba(30,30,30,0.95)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
          />
          <Line
            type="monotone"
            dataKey="temperatura"
            stroke="#4A90D9"
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2, fill: '#4A90D9', stroke: '#fff' }}
            activeDot={{ r: 6, fill: '#4A90D9', stroke: '#fff', strokeWidth: 2 }}
            name="Temperatura"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
