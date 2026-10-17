import { FC } from 'react';
import { usePublicData } from '../context/PublicDataContext';

interface FullScreenImageProps {
  src: string;
  alt: string;
  className?: string;
  cover?: boolean;
  panelId?: string;
}

export const FullScreenImage: FC<FullScreenImageProps> = ({ src, alt, className = '', panelId }) => {
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
    </div>
  );
};
