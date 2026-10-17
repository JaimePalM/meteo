import { FC } from 'react';
import { usePublicData } from '../context/PublicDataContext';

interface FullScreenImageProps {
  src: string;
  alt: string;
  className?: string;
  cover?: boolean;
  panelId?: string;
  showCalasanzLogo?: boolean;
}

export const FullScreenImage: FC<FullScreenImageProps> = ({
  src,
  alt,
  className = '',
  panelId,
  showCalasanzLogo = true,
}) => {
  const { carousel } = usePublicData();
  const image = panelId ? carousel.images.find((asset) => asset.panelId === panelId) : undefined;
  const imageSrc = image ? `/api/carousel/images/${panelId}?v=${image.version}` : src;
  return (
    <div className={`fullscreen-image-panel ${className}`}>
      <img 
        src={imageSrc}
        alt={alt} 
        className="fullscreen-image"
      />
      {showCalasanzLogo && (
        <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="slide-calasanz-logo" />
      )}
    </div>
  );
};
