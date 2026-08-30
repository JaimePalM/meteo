import { FC } from 'react';
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { temperatureDomain, toFiniteNumber } from '../utils/chartUtils';

interface ChartDataPoint {
  date: string;
  temp: number | string;
}

interface LineChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  color?: string;
  yAxisLabel?: string;
  height?: number | string;
}

export const SimpleLineChart: FC<LineChartProps> = ({
  data,
  loading = false,
  color = '#16828a',
  yAxisLabel = '°C',
  height = '100%',
}) => {
  const chartData = data
    .map((point) => ({ ...point, temp: toFiniteNumber(point.temp) }))
    .filter((point): point is { date: string; temp: number } => point.temp !== null);

  if (loading || chartData.length === 0) {
    return <div className="chart-plot chart-empty" style={{ height }}>{loading ? 'Cargando gráfico...' : 'Sin datos para mostrar'}</div>;
  }

  const [domainMin, domainMax] = temperatureDomain(chartData.map((point) => point.temp));

  return (
    <div className="chart-plot" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 14, left: 0, bottom: 4 }}>
          <CartesianGrid stroke="#dce4ea" strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="date" minTickGap={24} tick={{ fontSize: 11, fill: '#536471' }} tickLine={false} axisLine={{ stroke: '#cbd5df' }} />
          <YAxis domain={[domainMin, domainMax]} tick={{ fontSize: 11, fill: '#536471' }} tickFormatter={(value) => `${value}${yAxisLabel}`} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            contentStyle={{ backgroundColor: '#fff', border: '1px solid #d5dee5', borderRadius: '8px', color: '#1f2d38' }}
            labelStyle={{ color: '#536471', fontWeight: 600 }}
            formatter={(value) => [`${Number(value).toFixed(1)} ${yAxisLabel}`, 'Temperatura']}
          />
          <Line type="monotone" dataKey="temp" stroke={color} strokeWidth={2.75} dot={{ r: 2.5, fill: color, strokeWidth: 0 }} activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
