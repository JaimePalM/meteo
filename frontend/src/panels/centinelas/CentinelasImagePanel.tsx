import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

interface CentinelasImagePanelProps {
  panelNum: number;
  imageName: string;
}

export const CentinelasImagePanel: FC<CentinelasImagePanelProps> = ({ panelNum, imageName }) => {
  return (
    <FullScreenImage 
      src={`/centinelas-panel${panelNum}-${imageName}.jpg`} 
      alt={`Centinelas - Panel ${panelNum}`}
      className="centinelas-panel"
    />
  );
};