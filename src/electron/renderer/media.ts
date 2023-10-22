import { createContext, useCallback, useEffect, useState } from 'react';

export interface Media {
  xs: boolean;
}

const query = window.matchMedia('(min-width: 1280px)');
const xs = query.matches;

export function useMedia() {
  const [media, setMedia] = useState<Media>({ xs });
  const listener = useCallback(
    (media: MediaQueryListEvent) => setMedia({ xs: !media.matches }),
    []
  );

  useEffect(() => {
    query.addEventListener('change', listener);

    return () => {
      query.removeEventListener('change', listener);
    };
  }, []);

  return media;
}

export const MediaContext = createContext<Media>({ xs });
