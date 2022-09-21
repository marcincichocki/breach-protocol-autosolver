import { AppSettings, State } from '@/electron/common';
import { createContext } from 'react';

interface RouterExt {
  navigateToSetting: (id: keyof AppSettings) => void;
}

export const RouterExtContext = createContext<RouterExt>(null);
