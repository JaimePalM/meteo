import { useState, useEffect } from 'react';
import { riverApi, RiverData } from '../services/api';

export const useRiverData = () => {
  const [current, setCurrent] = useState<RiverData | null>(null);
  const [monthly, setMonthly] = useState<RiverData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [currentRes, monthlyRes] = await Promise.all([
          riverApi.getCurrent(),
          riverApi.getMonthlyHistory(),
        ]);

        setCurrent(currentRes.data);
        setMonthly(Array.isArray(monthlyRes.data) ? monthlyRes.data : []);
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching river data';
        console.error('[useRiverData] Error:', errorMsg);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return { current, monthly, loading, error };
};
