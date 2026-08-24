import { FC } from 'react';

export const Panel2: FC = () => {
  return (
    <div className="fullscreen-image-panel meteoescuela-panel panel2-dual">
      <div className="panel2-images">
        <img 
          src="/meteoescuela-2-1.jpg" 
          alt="Meteoescuela - Panel 2 - 1" 
          className="panel2-img"
        />
        <img 
          src="/meteoescuela-2-2.jpg" 
          alt="Meteoescuela - Panel 2 - 2" 
          className="panel2-img"
        />
      </div>
    </div>
  );
};