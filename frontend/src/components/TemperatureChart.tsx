import { FC } from 'react';
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { WeatherData } from '../services/api';
import { formatChartDate, temperatureDomain, toFiniteNumber, uniqueDailyRecords } from '../utils/chartUtils';

interface TemperatureChartProps {
  data: WeatherData[];
  loading: boolean;
  height?: number;
}

export const TemperatureChart: FC<TemperatureChartProps> = ({ data, loading, height = 400 }) => {
  if (loading) return <div className="chart-container" style={{ height }}><p>Cargando...</p></div>;
  if (!Array.isArray(data) || data.length === 0) return <div className="chart-container" style={{ height }}><p>Sin datos</p></div>;

  const chartData = uniqueDailyRecords(data)
    .map((item) => ({
      date: formatChartDate(item.recorded_date, { month: 'short', day: 'numeric' }),
      temp_max: toFiniteNumber(item.temperature_max),
      temp_min: toFiniteNumber(item.temperature_min),
      precipitation: toFiniteNumber(item.precipitation),
    }))
    .filter((item) => item.temp_max !== null || item.temp_min !== null || item.precipitation !== null);

  if (chartData.length === 0) return <div className="chart-container" style={{ height }}><p>Sin valores válidos para representar</p></div>;

  const [domainMin, domainMax] = temperatureDomain(
    chartData.flatMap(({ temp_max, temp_min }) => [temp_max ?? Number.NaN, temp_min ?? Number.NaN]),
  );

  return (
    <div className="chart-container temperature-chart" style={{ minHeight: height }}>
      <h3>Temperatura y precipitación · últimos 30 días</h3>
      <div className="chart-canvas">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
            <CartesianGrid stroke="#dce4ea" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" minTickGap={24} tick={{ fontSize: 11, fill: '#536471' }} tickLine={false} axisLine={{ stroke: '#cbd5df' }} />
            <YAxis yAxisId="left" domain={[domainMin, domainMax]} tick={{ fontSize: 11, fill: '#536471' }} tickFormatter={(value) => `${value}°`} tickLine={false} axisLine={false} width={40} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#536471' }} tickFormatter={(value) => `${value} mm`} tickLine={false} axisLine={false} width={54} />
            <Tooltip
              contentStyle={{ backgroundColor: '#fff', border: '1px solid #d5dee5', borderRadius: '8px', color: '#1f2d38' }}
              labelStyle={{ color: '#536471', fontWeight: 600 }}
              formatter={(value, name) => {
                const numericValue = typeof value === 'number' ? value : Number.parseFloat(String(value));
                return [name === 'Lluvia' ? `${numericValue.toFixed(1)} mm` : `${numericValue.toFixed(1)} °C`, name];
              }}
            />
            <Bar yAxisId="right" dataKey="precipitation" fill="#437bc0" radius={[4, 4, 0, 0]} opacity={0.72} name="Lluvia" isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="temp_max" stroke="#dc5a55" dot={false} strokeWidth={2.5} name="Máxima" isAnimationActive={false} />
            <Line yAxisId="left" type="monotone" dataKey="temp_min" stroke="#16828a" dot={false} strokeWidth={2.5} name="Mínima" isAnimationActive={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
