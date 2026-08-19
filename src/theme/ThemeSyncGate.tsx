import React from 'react';
import { useThemeSync } from './useThemeSync';

type ThemeSyncGateProps = {
  children: React.ReactNode;
};

export const ThemeSyncGate = ({ children }: ThemeSyncGateProps) => {
  useThemeSync();
  return <>{children}</>;
};
