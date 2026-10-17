import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

export const Panel1Logo: FC = () => {
  return (
    <FullScreenImage 
      src="/logo-calasanz.png" 
      alt="Meteoescuela - Logo Calasanz"
      className="meteoescuela-panel"
      panelId="panel-1"
      showCalasanzLogo={false}
    />
  );
};
