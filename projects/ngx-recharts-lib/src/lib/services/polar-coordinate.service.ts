import { Injectable, signal, computed } from '@angular/core';

/**
 * Service to manage polar coordinate system state for PieChart, RadarChart, and RadialBarChart.
 *
 * This is provided per-chart (like ChartDataService) via component-level providers.
 * The chart container initializes the coordinate state; child components inject and read it.
 *
 * @example
 * ```typescript
 * // In a polar chart component
 * @Component({
 *   providers: [PolarCoordinateService, ...]
 * })
 * export class PieChartComponent {
 *   private polarService = inject(PolarCoordinateService);
 *   constructor() {
 *     effect(() => {
 *       this.polarService.update({
 *         cx: this.cx(),
 *         cy: this.cy(),
 *         innerRadius: this.innerRadius(),
 *         outerRadius: this.outerRadius(),
 *       });
 *     });
 *   }
 * }
 *
 * // In a child component
 * export class PieComponent {
 *   private polarService = inject(PolarCoordinateService, { optional: true });
 *   readonly center = computed(() => this.polarService?.centerPoint() ?? { x: 0, y: 0 });
 * }
 * ```
 */
@Injectable()
export class PolarCoordinateService {
  // Configurable state (set by chart container)
  private readonly _cx = signal<number>(0);
  private readonly _cy = signal<number>(0);
  private readonly _innerRadius = signal<number>(0);
  private readonly _outerRadius = signal<number>(0);
  private readonly _startAngle = signal<number>(0);    // degrees
  private readonly _endAngle = signal<number>(360);    // degrees

  // Public readonly signals
  readonly cx = this._cx.asReadonly();
  readonly cy = this._cy.asReadonly();
  readonly innerRadius = this._innerRadius.asReadonly();
  readonly outerRadius = this._outerRadius.asReadonly();
  readonly startAngle = this._startAngle.asReadonly();
  readonly endAngle = this._endAngle.asReadonly();

  // Computed values
  readonly centerPoint = computed(() => ({ x: this._cx(), y: this._cy() }));
  readonly radiusRange = computed(() => [this._innerRadius(), this._outerRadius()] as [number, number]);
  readonly angleRange = computed(() => [this._startAngle(), this._endAngle()] as [number, number]);
  readonly maxRadius = computed(() => this._outerRadius());

  // Methods to update state (called by chart container)
  setCx(value: number): void { this._cx.set(value); }
  setCy(value: number): void { this._cy.set(value); }
  setInnerRadius(value: number): void { this._innerRadius.set(value); }
  setOuterRadius(value: number): void { this._outerRadius.set(value); }
  setStartAngle(value: number): void { this._startAngle.set(value); }
  setEndAngle(value: number): void { this._endAngle.set(value); }

  // Utility: convert polar to cartesian
  polarToCartesian(angle: number, radius: number): { x: number; y: number } {
    const radian = (angle - 90) * Math.PI / 180;
    return {
      x: this._cx() + radius * Math.cos(radian),
      y: this._cy() + radius * Math.sin(radian),
    };
  }

  // Utility: convert cartesian to polar
  cartesianToPolar(x: number, y: number): { angle: number; radius: number } {
    const dx = x - this._cx();
    const dy = y - this._cy();
    const radius = Math.sqrt(dx * dx + dy * dy);
    let angle = Math.atan2(dy, dx) * 180 / Math.PI + 90;
    if (angle < 0) angle += 360;
    return { angle, radius };
  }

  // Update all at once (for chart container initialization)
  update(config: {
    cx?: number;
    cy?: number;
    innerRadius?: number;
    outerRadius?: number;
    startAngle?: number;
    endAngle?: number;
  }): void {
    if (config.cx !== undefined) this._cx.set(config.cx);
    if (config.cy !== undefined) this._cy.set(config.cy);
    if (config.innerRadius !== undefined) this._innerRadius.set(config.innerRadius);
    if (config.outerRadius !== undefined) this._outerRadius.set(config.outerRadius);
    if (config.startAngle !== undefined) this._startAngle.set(config.startAngle);
    if (config.endAngle !== undefined) this._endAngle.set(config.endAngle);
  }
}
