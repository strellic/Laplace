import { useState, useEffect } from 'react';

const useWindowSize = () => {
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });

  useEffect(() => {
    window.addEventListener('resize', resizeHandler);
    return () => {
      window.removeEventListener('resize', resizeHandler);
    };
  });
  const resizeHandler = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };
  return windowSize;
};

export default useWindowSize;