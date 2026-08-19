import { useEffect } from 'react';
import { useDeviceContext } from 'twrnc';
import type { TailwindFn } from 'twrnc';
import { tailwind } from '@/theme';
import { useAppSelector } from '@/hooks';
import { selectTheme } from '@/store/settings/settingsSelectors';

// `setColorScheme` is attached to the tailwind instance at runtime by twrnc
// (see node_modules/twrnc/dist/esm/create.js), and is exactly what twrnc's
// own `useDeviceContext`/`useAppColorScheme` hooks call internally. It is
// missing from twrnc's shipped `TailwindFn` type, so it's cast in here.
type TailwindFnWithColorScheme = TailwindFn & {
  setColorScheme: (colorScheme: 'light' | 'dark') => void;
};

export const useThemeSync = () => {
  useDeviceContext(tailwind, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: 'light',
  });

  const theme = useAppSelector(selectTheme);
  const colorScheme = theme === 'dark' ? 'dark' : 'light';

  useEffect(() => {
    (tailwind as TailwindFnWithColorScheme).setColorScheme(colorScheme);
  }, [colorScheme]);

  return colorScheme;
};
