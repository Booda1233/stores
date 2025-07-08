
import { useState, useEffect, useCallback } from 'react';

export const useReadingProgress = (targetRef: React.RefObject<HTMLElement>): number => {
  const [progress, setProgress] = useState(0);

  const scrollListener = useCallback(() => {
    if (!targetRef.current) {
      return;
    }

    const element = targetRef.current;
    const totalHeight = element.clientHeight;
    const windowHeight = window.innerHeight;
    const scrollTop = window.scrollY;
    
    const elementTop = element.offsetTop;
    
    if (scrollTop < elementTop) {
      setProgress(0);
      return;
    }
    
    if (scrollTop > elementTop + totalHeight - windowHeight) {
      setProgress(100);
      return;
    }
    
    const scrolled = scrollTop - elementTop;
    const scrollableHeight = totalHeight - windowHeight;
    
    if (scrollableHeight <= 0) {
        setProgress(100);
        return;
    }

    const currentProgress = (scrolled / scrollableHeight) * 100;
    setProgress(currentProgress);

  }, [targetRef]);

  useEffect(() => {
    window.addEventListener("scroll", scrollListener);
    return () => window.removeEventListener("scroll", scrollListener);
  }, [scrollListener]);

  return progress;
};
