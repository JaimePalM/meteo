import { FC } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { RiverData } from '../services/api';

interface RiverTemperatureChartProps {
  data: RiverData[];
  loading: boolean;
}

export const RiverTemperatureChart: FC<RiverTemperatureChartProps> = ({ data, loading }) => {
  if (loading) {
    return (
      <div className="chart-container">
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
    <div className="chart-container">
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 11, fill: '#666' }}
            interval="preserveStartEnd"
          />
          <YAxis
            domain={['dataMin - 1', 'dataMax + 1']}
            tick={{ fontSize: 11, fill: '#666' }}
            label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 5 }}
          />
          <Tooltip
            formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
            labelStyle={{ color: '#333' }}
            contentStyle={{ borderRadius: '8px', border: '1px solid #ddd' }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperatura"
            stroke="#4A90D9"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4A90D9' }}
            activeDot={{ r: 5 }}
            name="Temperatura"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
