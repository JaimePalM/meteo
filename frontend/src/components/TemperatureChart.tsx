import { FC } from 'react';
import { ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeatherData } from '../services/api';

interface TemperatureChartProps {
  data: WeatherData[];
  loading: boolean;
  height?: number;
}

export const TemperatureChart: FC<TemperatureChartProps> = ({ data, loading, height = 220 }) => {
  if (loading) {
    return <div className="chart-container" style={{ height }}><p>Cargando...</p></div>;
  }

  if (!Array.isArray(data) || data.length === 0) {
    return <div className="chart-container" style={{ height }}><p>Sin datos</p></div>;
  }

  const chartData = data.map((item) => {
    const maxTemp = typeof item.temperature_max === 'string' ? parseFloat(item.temperature_max) : item.temperature_max;
    const minTemp = typeof item.temperature_min === 'string' ? parseFloat(item.temperature_min) : item.temperature_min;
    const precipValue = typeof item.precipitation === 'string' ? parseFloat(item.precipitation) : item.precipitation;
    return {
      date: new Date(item.recorded_date).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      }),
      temp_max: maxTemp,
      temp_min: minTemp,
      precipitation: precipValue,
    };
  });

  // Calculate temp range for nice tick intervals
  const temps = chartData.flatMap(d => [d.temp_max, d.temp_min]);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const range = maxTemp - minTemp;
  const tickInterval = range > 20 ? 10 : range > 10 ? 5 : 2;
  
  // Calculate nice domain bounds
  const domainMin = Math.floor((minTemp - 2) / tickInterval) * tickInterval;
  const domainMax = Math.ceil((maxTemp + 2) / tickInterval) * tickInterval;
  
  // Generate explicit tick values
  const ticks = [];
  for (let v = domainMin; v <= domainMax; v += tickInterval) {
    ticks.push(v);
  }

  return (
    <div className="chart-container temperature-chart" style={{ height: '100%', minHeight: height }}>
      <h3>📊 Temperatura & Precipitación (30 días)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={chartData} margin={{ top: 5, right: 60, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
          />
          <YAxis 
            yAxisId="left"
            domain={[domainMin, domainMax]}
            ticks={ticks}
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickFormatter={(value) => `${value}`}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            label={{ value: '°C', angle: -90, position: 'insideLeft', offset: 10, fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fontSize: 10, fill: 'rgba(255,255,255,0.9)' }}
            tickLine={false}
            axisLine={{ stroke: 'rgba(255,255,255,0.3)' }}
            label={{ value: 'mm', angle: 90, position: 'insideRight', offset: -10, fontSize: 11, fill: 'rgba(255,255,255,0.7)' }}
          />
          <Tooltip
            contentStyle={{ 
              backgroundColor: 'rgba(30,30,30,0.95)', 
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'white'
            }}
            formatter={(value, name) => {
              if (name === 'precipitation') {
                return [`${(typeof value === 'number' ? value : parseFloat(value as string)).toFixed(1)} mm`, 'Precipitación'];
              }
              return [`${(typeof value === 'number' ? value : parseFloat(value as string)).toFixed(1)}°C`, 'Temperatura'];
            }}
            labelFormatter={(label: string) => label}
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="temp_max" 
            stroke="#FF6B6B" 
            dot={false} 
            strokeWidth={2}
            name="Máx"
          />
          <Line 
            yAxisId="left"
            type="monotone" 
            dataKey="temp_min" 
            stroke="#4ECDC4" 
            dot={false} 
            strokeWidth={2}
            name="Mín"
          />
          <Bar 
            yAxisId="right"
            dataKey="precipitation" 
            fill="#6C5CE7"
            radius={[4, 4, 0, 0]}
            opacity={0.7}
            name="Lluvia"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
};
