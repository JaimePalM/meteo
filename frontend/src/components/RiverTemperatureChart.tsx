import { FC } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { RiverData } from '../services/api';
import { formatChartDate, temperatureDomain, toFiniteNumber, uniqueDailyRecords } from '../utils/chartUtils';

interface RiverTemperatureChartProps {
  data: RiverData[];
  loading: boolean;
  height?: number;
}

export const RiverTemperatureChart: FC<RiverTemperatureChartProps> = ({ data, loading, height = 300 }) => {
  if (loading) return <div className="chart-plot chart-empty" style={{ height }}>Cargando...</div>;

  const chartData = uniqueDailyRecords(data)
    .map((item) => ({
      date: formatChartDate(item.recorded_date, { month: 'short', day: 'numeric' }),
      temperature: toFiniteNumber(item.temperature),
    }))
    .filter((item): item is { date: string; temperature: number } => item.temperature !== null);

  if (chartData.length === 0) return <div className="chart-plot chart-empty" style={{ height }}>Sin datos</div>;

  const [domainMin, domainMax] = temperatureDomain(chartData.map((item) => item.temperature));

  return (
    <div className="chart-plot" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 14, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#dce4ea" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" minTickGap={24} tick={{ fontSize: 11, fill: '#536471' }} tickLine={false} axisLine={{ stroke: '#cbd5df' }} />
          <YAxis domain={[domainMin, domainMax]} tick={{ fontSize: 11, fill: '#536471' }} tickFormatter={(value) => `${value}°`} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d5dee5', borderRadius: '8px', color: '#1f2d38' }}
            labelStyle={{ color: '#536471', fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toFixed(1)} °C`, 'Temperatura']}
          />
          <Line type="monotone" dataKey="temperature" stroke="#2878b9" strokeWidth={2.75} dot={{ r: 2.5, fill: '#2878b9', strokeWidth: 0 }} activeDot={{ r: 5, fill: '#2878b9', stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
