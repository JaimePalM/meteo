import { CSSProperties, FC, ReactNode, useState, useEffect } from 'react';
import { usePublicData } from '../context/PublicDataContext';

interface CarouselProps {
  children: ReactNode[];
  interval?: number;
  autoPlay?: boolean;
  panelNames?: string[];
}

export const Carousel: FC<CarouselProps> = ({ 
  children, 
  interval = 10000, 
  autoPlay = true,
  panelNames = []
}) => {
  const { carousel } = usePublicData();
  const [currentIndex, setCurrentIndex] = useState(0);
  const effectiveInterval = carousel.intervalMs ?? interval;
  const isAutoPlayEnabled = autoPlay && effectiveInterval > 0;
  const shouldShowIndicators = carousel.showIndicators || effectiveInterval === 0;

  useEffect(() => {
    if (!isAutoPlayEnabled) return;
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, effectiveInterval);

    return () => clearInterval(timer);
  }, [children.length, effectiveInterval, isAutoPlayEnabled]);

  const getPanelName = (index: number) => {
    return panelNames[index] || `Panel ${index + 1}`;
  };

  return (
    <div className="carousel">
      <div className="carousel-container">
        {children.map((child, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''} ${carousel.backgrounds[`panel-${index + 1}`] ? 'has-custom-background' : ''}`}
            style={carousel.backgrounds[`panel-${index + 1}`] ? { '--slide-background': carousel.backgrounds[`panel-${index + 1}`] } as CSSProperties : undefined}
          >
            {child}
          </div>
        ))}
      </div>
      {shouldShowIndicators && <div className="carousel-indicators">
        {children.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to ${getPanelName(index)}`}
            title={getPanelName(index)}
          >
            {getPanelName(index)}
          </button>
        ))}
      </div>
      }
    </div>
  );
};
