import { FC } from 'react';

interface PressureGaugeProps {
  value: number | string;
}

export const PressureGauge: FC<PressureGaugeProps> = ({ value }) => {
  // Convertir a número si es string
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  // Normalizar el valor entre 0 y 100 (rango típico de presión: 950-1050 hPa)
  const min = 950;
  const max = 1050;
  const percentage = Math.max(0, Math.min(100, ((numValue - min) / (max - min)) * 100));
  
  // Color basado en el valor (verde = normal, rojo = alta, azul = baja)
  let color = '#FF8C00'; // Naranja normal
  if (numValue > 1013) {
    color = '#FF6B6B'; // Rojo para alta presión
  } else if (numValue < 1013) {
    color = '#4ECDC4'; // Turquesa para baja presión
  }

  const rotation = (percentage / 100) * 180 - 90; // -90 a 90 grados

  return (
    <div className="pressure-gauge-container">
      <div className="gauge-wrapper">
        <svg className="gauge-svg" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid meet">
          {/* Arco de fondo */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="6"
            strokeLinecap="round"
          />
          {/* Arco de valor */}
          <path
            d="M 20 80 A 60 60 0 0 1 140 80"
            fill="none"
            stroke={color}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.88} 188`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {/* Marcas simplificadas */}
          <g className="gauge-marks" fontSize="8" textAnchor="middle" fill="#999">
            <text x="20" y="95">950</text>
            <text x="80" y="15">1000</text>
            <text x="140" y="95">1050</text>
          </g>
          {/* Aguja */}
          <g transform={`translate(80, 80) rotate(${rotation})`}>
            <polygon points="0,-40 -3,0 3,0" fill={color} />
            <circle r="5" fill={color} />
          </g>
        </svg>
      </div>
      <div className="gauge-value">
        <span className="pressure-number">{numValue.toFixed(1)}</span>
        <span className="pressure-unit">hPa</span>
      </div>
    </div>
  );
};
