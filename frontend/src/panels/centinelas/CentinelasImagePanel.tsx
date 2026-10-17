import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

interface CentinelasImagePanelProps {
  panelNum: number;
}

export const CentinelasImagePanel: FC<CentinelasImagePanelProps> = ({ panelNum }) => {
  return (
    <FullScreenImage 
      src={`/centinelas-${panelNum}.jpg`} 
      alt={`Centinelas - Panel ${panelNum}`}
      className="centinelas-panel"
      panelId={`panel-${panelNum}`}
    />
  );
};
