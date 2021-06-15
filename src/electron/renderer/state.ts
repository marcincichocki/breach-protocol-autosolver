import { State } from '@/electron/common';
import { createContext } from 'react';

export const StateContext = createContext<State>(null);
