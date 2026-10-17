import { createContext, FC, ReactNode, useContext, useEffect, useState } from 'react';
import { carouselApi, CarouselSettings } from '../services/api';
import { useCentinelasData } from '../hooks/useCentinelasData';
import { usePOMData } from '../hooks/usePOMData';
import { useRiverData } from '../hooks/useRiverData';
import { useWeatherData } from '../hooks/useWeatherData';

type PublicDataContextValue = {
  weather: ReturnType<typeof useWeatherData>;
  river: ReturnType<typeof useRiverData>;
  centinelas: ReturnType<typeof useCentinelasData>;
  pom: ReturnType<typeof usePOMData>;
  carousel: CarouselSettings;
};

const PublicDataContext = createContext<PublicDataContextValue | null>(null);

export const PublicDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const weather = useWeatherData();
  const river = useRiverData();
  const centinelas = useCentinelasData();
  const pom = usePOMData();
  const [carousel, setCarousel] = useState<CarouselSettings>({ intervalMs: 10000, showIndicators: true, backgrounds: {}, images: [] });

  useEffect(() => {
    const fetchCarouselSettings = async () => {
      try {
        const response = await carouselApi.getSettings();
        setCarousel(response.data);
      } catch (error) {
        console.error('[CAROUSEL] Unable to refresh settings', error);
      }
    };
    fetchCarouselSettings();
    const interval = window.setInterval(fetchCarouselSettings, 15_000);
    return () => window.clearInterval(interval);
  }, []);

  return <PublicDataContext.Provider value={{ weather, river, centinelas, pom, carousel }}>{children}</PublicDataContext.Provider>;
};

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context) throw new Error('usePublicData debe utilizarse dentro de PublicDataProvider');
  return context;
};
