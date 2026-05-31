import { useState, useEffect } from 'react';

export const useLoading = (minimumLoadingTime = 1500) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate initial app loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, minimumLoadingTime);

    return () => clearTimeout(timer);
  }, [minimumLoadingTime]);

  return isLoading;
};

export default useLoading;
