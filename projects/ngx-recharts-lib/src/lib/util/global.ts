import { InjectionToken } from '@angular/core';

export interface GlobalConfig {
  isSsr: boolean;
  defaultAnimationDuration: number;
  defaultAnimationEasing: string;
  defaultAnimationActive: boolean;
}

export const DEFAULT_GLOBAL_CONFIG: GlobalConfig = {
  isSsr: false,
  defaultAnimationDuration: 300,
  defaultAnimationEasing: 'ease',
  defaultAnimationActive: true,
};

export const RECHARTS_GLOBAL_CONFIG = new InjectionToken<GlobalConfig>(
  'RECHARTS_GLOBAL_CONFIG',
  { providedIn: 'root', factory: () => DEFAULT_GLOBAL_CONFIG }
);
