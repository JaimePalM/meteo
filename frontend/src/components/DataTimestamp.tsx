import { FC } from 'react';
import { formatChartDate } from '../utils/chartUtils';

export const DataTimestamp: FC<{ recordedDate?: string }> = ({ recordedDate }) => {
  if (!recordedDate) return <span className="panel-data-date">Actualizando datos…</span>;

  return (
    <span className="panel-data-date">
      Última medición · {formatChartDate(recordedDate, { day: 'numeric', month: 'short', year: 'numeric' })}
    </span>
  );
};
