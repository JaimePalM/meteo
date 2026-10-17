import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

export const Panel20Placeholder: FC = () => {
  return (
    <FullScreenImage 
      src="/rios-20.jpg" 
      alt="Ríos - Panel 20"
      className="rios-panel"
      panelId="panel-20"
    />
  );
};
