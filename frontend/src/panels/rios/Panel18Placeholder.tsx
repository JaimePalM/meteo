import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

export const Panel18Placeholder: FC = () => {
  return (
    <FullScreenImage 
      src="/rios-18.png" 
      alt="Ríos - Panel 18"
      className="rios-panel"
      panelId="panel-18"
    />
  );
};
