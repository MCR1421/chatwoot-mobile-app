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
  getColorScheme: () => string | null | undefined;
};

// Mutates twrnc's internal color scheme synchronously. Components that use
// static `dark:` prefixed classes (rather than reading `theme` from Redux
// themselves) only pick up the new scheme if it's already been flipped by
// the time THEY render — a `useEffect` runs after commit, too late for any
// re-render triggered in the same tick as the toggle, which is why calling
// this from `onToggleDarkMode` (synchronously, before dispatch) matters as
// much as the effect below that handles first-mount/rehydration.
export const setTailwindColorScheme = (colorScheme: 'light' | 'dark') => {
  (tailwind as TailwindFnWithColorScheme).setColorScheme(colorScheme);
};

export const useThemeSync = () => {
  const theme = useAppSelector(selectTheme);
  const colorScheme = theme === 'dark' ? 'dark' : 'light';

  // `initialColorScheme` must reflect the already-rehydrated Redux value
  // (this hook only ever mounts inside <PersistGate>, so `theme` is correct
  // by the time this runs), not a hardcoded default. useDeviceContext sets
  // it synchronously during this component's FIRST render, before any
  // effect runs — a screen that mounts eagerly in that same first render
  // (e.g. a tab navigator's initialRouteName) would otherwise read twrnc's
  // still-default colorScheme and never get nudged to re-render once the
  // effect below corrects it, since the Redux value itself never changes
  // again after that first render.
  useDeviceContext(tailwind, {
    observeDeviceColorSchemeChanges: false,
    initialColorScheme: colorScheme,
  });

  useEffect(() => {
    setTailwindColorScheme(colorScheme);
  }, [colorScheme]);

  return colorScheme;
};
