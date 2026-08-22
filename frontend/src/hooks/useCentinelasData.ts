import { useState, useEffect } from 'react';
import { centinelasApi, CentinelasData } from '../services/api';

export const useCentinelasData = () => {
  const [current, setCurrent] = useState<CentinelasData | null>(null);
  const [monthly, setMonthly] = useState<CentinelasData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currentRes, monthlyRes] = await Promise.all([
        centinelasApi.getCurrent(),
        centinelasApi.getMonthlyHistory(),
      ]);
      setCurrent(currentRes.data);
      let data = monthlyRes.data;
      if (!Array.isArray(data)) data = data ? [data] : [];
      setMonthly(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  return { current, monthly, loading, error, refresh: fetchData };
};