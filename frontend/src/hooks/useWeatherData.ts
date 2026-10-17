import { useState, useEffect } from 'react';
import { weatherApi, WeatherData } from '../services/api';

export const useWeatherData = () => {
  const [current, setCurrent] = useState<WeatherData | null>(null);
  const [monthly, setMonthly] = useState<WeatherData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('[useWeatherData] Fetching current and monthly data...');
        
        const [currentRes, monthlyRes] = await Promise.all([
          weatherApi.getCurrentWeather(),
          weatherApi.getMonthlyHistory(),
        ]);

        console.log('[useWeatherData] currentRes.data type:', typeof currentRes.data, Array.isArray(currentRes.data));
        console.log('[useWeatherData] monthlyRes.data type:', typeof monthlyRes.data, Array.isArray(monthlyRes.data));
        console.log('[useWeatherData] monthlyRes.data length:', Array.isArray(monthlyRes.data) ? monthlyRes.data.length : 'N/A');
        console.log('[useWeatherData] currentRes.data:', currentRes.data);
        console.log('[useWeatherData] monthlyRes.data sample:', Array.isArray(monthlyRes.data) ? monthlyRes.data.slice(0, 2) : monthlyRes.data);

        setCurrent(currentRes.data);
        
        // Ensure monthly is always an array
        const monthlyData = Array.isArray(monthlyRes.data) ? monthlyRes.data : (monthlyRes.data ? [monthlyRes.data] : []);
        setMonthly(monthlyData);
        
        console.log('[useWeatherData] State updated with', monthlyData.length, 'monthly records');
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error fetching weather data';
        console.error('[useWeatherData] Error:', errorMsg, err);
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    
    // The display runs unattended; poll so newly entered data appears without reloading.
    const interval = setInterval(fetchData, 15_000);
    return () => clearInterval(interval);
  }, []);

  return { current, monthly, loading, error };
};
