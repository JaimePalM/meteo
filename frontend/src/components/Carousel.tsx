import { FC, ReactNode, useState, useEffect } from 'react';

interface CarouselProps {
  children: ReactNode[];
  interval?: number; // ms
}

export const Carousel: FC<CarouselProps> = ({ children, interval = 10000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % children.length);
    }, interval);

    return () => clearInterval(timer);
  }, [children.length, interval]);

  return (
    <div className="carousel">
      <div className="carousel-container">
        {children.map((child, index) => (
          <div
            key={index}
            className={`carousel-item ${index === currentIndex ? 'active' : ''}`}
          >
            {child}
          </div>
        ))}
      </div>
      <div className="carousel-indicators">
        {children.map((_, index) => (
          <button
            key={index}
            className={`indicator ${index === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};
