import { Injectable, InjectionToken, inject, signal, computed } from '@angular/core';
import { RECHARTS_GLOBAL_CONFIG } from '../util/global';

export interface ChartAnimationConfig {
  isAnimationActive: boolean;
  animationBegin: number;
  animationDuration: number;
  animationEasing: string;
}

export const CHART_ANIMATION_CONFIG = new InjectionToken<ChartAnimationConfig>(
  'CHART_ANIMATION_CONFIG',
  {
    providedIn: 'root',
    factory: () => ({
      isAnimationActive: true,
      animationBegin: 0,
      animationDuration: 300,
      animationEasing: 'ease',
    }),
  }
);

@Injectable()
export class AnimationService {
  private readonly globalConfig = inject(RECHARTS_GLOBAL_CONFIG);
  private readonly defaultConfig = inject(CHART_ANIMATION_CONFIG);

  private readonly _isAnimationActive = signal(this.defaultConfig.isAnimationActive);
  private readonly _animationBegin = signal(this.defaultConfig.animationBegin);
  private readonly _animationDuration = signal(this.defaultConfig.animationDuration);
  private readonly _animationEasing = signal(this.defaultConfig.animationEasing);

  /** Whether animation is active, respecting global animation disable */
  readonly isAnimationActive = computed(() =>
    this.globalConfig.defaultAnimationActive && this._isAnimationActive()
  );

  /** Animation begin delay in milliseconds */
  readonly animationBegin = this._animationBegin.asReadonly();

  /** Animation duration in milliseconds */
  readonly animationDuration = this._animationDuration.asReadonly();

  /** Animation easing function name */
  readonly animationEasing = this._animationEasing.asReadonly();

  setAnimationActive(active: boolean): void {
    this._isAnimationActive.set(active);
  }

  setAnimationBegin(begin: number): void {
    this._animationBegin.set(begin);
  }

  setAnimationDuration(duration: number): void {
    this._animationDuration.set(duration);
  }

  setAnimationEasing(easing: string): void {
    this._animationEasing.set(easing);
  }

  /** Returns a CSS style object for transition based on current animation config */
  getTransitionStyle(): Record<string, string> {
    if (!this.isAnimationActive()) return {};
    const delay = `${this._animationBegin()}ms`;
    const duration = `${this._animationDuration()}ms`;
    const easing = this._animationEasing();
    return { transition: `all ${duration} ${easing} ${delay}` };
  }
}
