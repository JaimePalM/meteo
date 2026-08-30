export type NumericValue = number | string | null | undefined;

export const toFiniteNumber = (value: NumericValue): number | null => {
  const numberValue = typeof value === 'number' ? value : Number.parseFloat(value ?? '');
  return Number.isFinite(numberValue) ? numberValue : null;
};

export const formatChartDate = (value: string, options: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-ES', { timeZone: 'UTC', ...options }).format(new Date(value));

/** Keeps the last entry for each date and returns the series in chronological order. */
export const uniqueDailyRecords = <T extends { recorded_date: string }>(records: T[]): T[] => {
  const byDate = new Map<string, T>();

  records.forEach((record) => {
    const date = new Date(record.recorded_date);
    if (!Number.isNaN(date.getTime())) byDate.set(record.recorded_date.slice(0, 10), record);
  });

  return [...byDate.values()].sort(
    (first, second) => new Date(first.recorded_date).getTime() - new Date(second.recorded_date).getTime(),
  );
};

export const temperatureDomain = (values: number[]): [number, number] => {
  const validValues = values.filter(Number.isFinite);
  if (validValues.length === 0) return [0, 30];

  const minimum = Math.min(...validValues);
  const maximum = Math.max(...validValues);
  const padding = Math.max(1, (maximum - minimum) * 0.15);
  return [Math.floor(minimum - padding), Math.ceil(maximum + padding)];
};
