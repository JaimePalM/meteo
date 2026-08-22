import { useState, useEffect } from 'react';
import { pomApi, POMData } from '../services/api';

export const usePOMData = () => {
  const [current, setCurrent] = useState<POMData | null>(null);
  const [monthly, setMonthly] = useState<POMData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [currentRes, monthlyRes] = await Promise.all([
        pomApi.getCurrent(),
        pomApi.getMonthlyHistory(),
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