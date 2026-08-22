import { FC } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartDataPoint {
  date: string;
  temp: number;
}

interface LineChartProps {
  data: ChartDataPoint[];
  loading?: boolean;
  color?: string;
  yAxisLabel?: string;
  height?: number;
}

export const SimpleLineChart: FC<LineChartProps> = ({ 
  data, 
  loading = false, 
  color = '#4ECDC4', 
  yAxisLabel = '°C',
  height = 200
}) => {
  if (loading || !data || data.length === 0) {
    return (
      <div className="chart-container" style={{ height }}>
        <div style={{ 
          height: '100%', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          color: '#6b7280' 
        }}>
          {loading ? 'Cargando gráfico...' : 'Sin datos para mostrar'}
        </div>
      </div>
    );
  }

  const temps = data.map(d => d.temp);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp;
  const tickInterval = range > 10 ? 5 : range > 5 ? 2 : 1;
  
  const domainMin = Math.floor((minTemp - 1) / tickInterval) * tickInterval;
  const domainMax = Math.ceil((maxTemp + 1) / tickInterval) * tickInterval;

  const ticks = [];
  for (let v = domainMin; v <= domainMax; v += tickInterval) {
    ticks.push(v);
  }

  return (
    <div className="chart-container" style={{ height, width: '100%' }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
          />
          <YAxis
            domain={[domainMin, domainMax]}
            ticks={ticks}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickFormatter={(value) => `${value}`}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            label={{ 
              value: yAxisLabel, 
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
            formatter={(value: number) => [`${value.toFixed(1)}°C`, 'Temperatura']}
            labelFormatter={(label: string) => label}
          />
          <Line
            type="monotone"
            dataKey="temp"
            stroke={color}
            strokeWidth={2.5}
            dot={{ r: 4, strokeWidth: 2, fill: color, stroke: '#fff' }}
            activeDot={{ r: 6, fill: color, stroke: '#fff', strokeWidth: 2 }}
            isAnimationActive={!loading}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};