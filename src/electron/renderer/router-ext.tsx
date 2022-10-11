import { AppSettings } from '@/electron/common';
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
} from 'react';
import { NavLinkProps, To, useNavigate } from 'react-router-dom';

export interface NavigationItem extends NavLinkProps {
  label: string;
}

export interface Navigation {
  /** Current navigation items. */
  readonly items?: NavigationItem[];

  /** Path for back button. */
  readonly from?: To;
}

interface RouterExt extends Navigation {
  navigateToSetting: (id: keyof AppSettings) => void;

  /** Overrides navigation for current route. */
  override(navigation: Navigation): void;

  /** Resets navigation to the default. */
  reset(): void;
}

export const RouterExtContext = createContext<RouterExt>(null);

export function useNavigation({
  items = defaultNavigationItems,
  from,
}: Navigation): void {
  const { override, reset } = useContext(RouterExtContext);

  useLayoutEffect(() => {
    override({ items, from });

    return () => {
      reset();
    };
  }, []);
}

const defaultNavigationItems: NavigationItem[] = [
  {
    label: 'Dashboard',
    to: '/',
    end: true,
  },
  {
    label: 'History',
    to: '/history',
  },
  {
    label: 'Settings',
    to: '/settings',
  },
];

export const RouterExt = ({ children }: PropsWithChildren) => {
  const navigate = useNavigate();
  const [items, setItems] = useState<NavigationItem[]>(defaultNavigationItems);
  const [from, setFrom] = useState<To>(null);

  const navigateToSetting = useCallback((id: keyof AppSettings) => {
    navigate(`/settings#${id}`);
  }, []);

  const override = useCallback(({ items, from }: Navigation) => {
    setFrom(from);
    setItems(items);
  }, []);

  const reset = useCallback(() => {
    setFrom(null);
    setItems(defaultNavigationItems);
  }, []);

  return (
    <RouterExtContext.Provider
      value={{ navigateToSetting, override, reset, items, from }}
    >
      {children}
    </RouterExtContext.Provider>
  );
};
