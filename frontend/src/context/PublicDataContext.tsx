import { createContext, FC, ReactNode, useContext } from 'react';
import { useCentinelasData } from '../hooks/useCentinelasData';
import { usePOMData } from '../hooks/usePOMData';
import { useRiverData } from '../hooks/useRiverData';
import { useWeatherData } from '../hooks/useWeatherData';

type PublicDataContextValue = {
  weather: ReturnType<typeof useWeatherData>;
  river: ReturnType<typeof useRiverData>;
  centinelas: ReturnType<typeof useCentinelasData>;
  pom: ReturnType<typeof usePOMData>;
};

const PublicDataContext = createContext<PublicDataContextValue | null>(null);

export const PublicDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const weather = useWeatherData();
  const river = useRiverData();
  const centinelas = useCentinelasData();
  const pom = usePOMData();

  return <PublicDataContext.Provider value={{ weather, river, centinelas, pom }}>{children}</PublicDataContext.Provider>;
};

export const usePublicData = () => {
  const context = useContext(PublicDataContext);
  if (!context) throw new Error('usePublicData debe utilizarse dentro de PublicDataProvider');
  return context;
};
