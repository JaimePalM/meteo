import { FC } from 'react';

interface FullScreenImageProps {
  src: string;
  alt: string;
  className?: string;
}

export const FullScreenImage: FC<FullScreenImageProps> = ({ src, alt, className = '' }) => {
  return (
    <div className={`fullscreen-image-panel ${className}`}>
      <img 
        src={src} 
        alt={alt} 
        className="fullscreen-image"
      />
    </div>
  );
};