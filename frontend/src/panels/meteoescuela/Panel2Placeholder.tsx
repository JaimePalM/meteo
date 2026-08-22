import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

export const Panel2Placeholder: FC = () => {
  return (
    <FullScreenImage 
      src="/meteoescuela-panel2-placeholder.jpg" 
      alt="Meteoescuela - Panel 2"
      className="meteoescuela-panel"
    />
  );
};