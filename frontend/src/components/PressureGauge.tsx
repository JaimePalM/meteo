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
  let color = '#4CAF50'; // Verde normal
  if (numValue > 1013) {
    color = '#FF6B6B'; // Rojo para alta presión
  } else if (numValue < 1013) {
    color = '#4ECDC4'; // Turquesa para baja presión
  }

  const rotation = (percentage / 100) * 180 - 90; // -90 a 90 grados

  return (
    <div className="pressure-gauge-container">
      <div className="gauge-wrapper">
        <svg className="gauge-svg" viewBox="0 0 200 120" preserveAspectRatio="xMidYMid meet">
          {/* Arco de fondo */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
            strokeLinecap="round"
          />
          {/* Arco de valor */}
          <path
            d="M 30 100 A 70 70 0 0 1 170 100"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 2.2} 220`}
            style={{ transition: 'stroke-dasharray 0.5s ease' }}
          />
          {/* Marcas */}
          <g className="gauge-marks" fontSize="10" textAnchor="middle" fill="#666">
            <text x="30" y="115">950</text>
            <text x="100" y="20">1000</text>
            <text x="170" y="115">1050</text>
          </g>
          {/* Aguja */}
          <g transform={`translate(100, 100) rotate(${rotation})`}>
            <polygon points="0,-50 -4,0 4,0" fill={color} />
            <circle r="6" fill={color} />
          </g>
        </svg>
      </div>
      <div className="gauge-value">
        <span className="pressure-number">{numValue.toFixed(2)}</span>
        <span className="pressure-unit">hPa</span>
      </div>
    </div>
  );
};
