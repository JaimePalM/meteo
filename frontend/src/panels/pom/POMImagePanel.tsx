import { FC } from 'react';
import { FullScreenImage } from '../../components/FullScreenImage';

interface POMImagePanelProps {
  panelNum: number;
}

export const POMImagePanel: FC<POMImagePanelProps> = ({ panelNum }) => {
  return (
    <FullScreenImage 
      src={`/pom-${panelNum}.jpg`} 
      alt={`POM - Panel ${panelNum}`}
      className="pom-panel"
    />
  );
};