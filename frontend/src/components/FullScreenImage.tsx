import { FC, useEffect, useState } from 'react';
import { usePublicData } from '../context/PublicDataContext';
import { getApiUrl } from '../services/api';

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
  const imageSrc = image ? getApiUrl(`/carousel/images/${panelId}?v=${image.version}`) : src;
  const [hasLoadError, setHasLoadError] = useState(false);

  useEffect(() => {
    setHasLoadError(false);
  }, [imageSrc]);

  return (
    <div className={`fullscreen-image-panel ${className}`}>
      <img 
        src={hasLoadError ? src : imageSrc}
        alt={alt} 
        className="fullscreen-image"
        onError={() => {
          if (image) setHasLoadError(true);
        }}
      />
      {showCalasanzLogo && (
        <img src="/logo-calasanz.png" alt="Logo Calasanz Santander" className="slide-calasanz-logo" />
      )}
    </div>
  );
};
