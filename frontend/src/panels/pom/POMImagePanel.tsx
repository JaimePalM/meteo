import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

interface POMImagePanelProps {
  panelNum: number;
  imageName: string;
}

export const POMImagePanel: FC<POMImagePanelProps> = ({ panelNum, imageName }) => {
  return (
    <FullScreenImage 
      src={`/pom-panel${panelNum}-${imageName}.jpg`} 
      alt={`POM - Panel ${panelNum}`}
      className="pom-panel"
    />
  );
};