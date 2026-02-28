import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  OnDestroy,
} from '@angular/core';
import { SectorComponent } from '../shape/sector.component';
import { ChartDataService } from '../services/chart-data.service';
import { GraphicalItemRegistryService } from '../services/graphical-item-registry.service';
import { PolarCoordinateService } from '../services/polar-coordinate.service';

export interface RadialBarEntry {
  innerRadius: number;
  outerRadius: number;
  startAngle: number;
  endAngle: number;
  fill: string;
  name: string;
  value: number;
}

@Component({
  selector: 'svg:g[ngx-radial-bar]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [SectorComponent],
  template: `
    @if (!hide()) {
      @for (bar of bars(); track $index) {
        @if (background()) {
          <svg:g ngx-sector
            [cx]="resolvedCx()"
            [cy]="resolvedCy()"
            [innerRadius]="bar.innerRadius"
            [outerRadius]="bar.outerRadius"
            [startAngle]="0"
            [endAngle]="360"
            [fill]="'#eee'"
            [stroke]="'none'"
            [isAnimationActive]="isAnimationActive()"
            [animationBegin]="animationBegin()"
            [animationDuration]="animationDuration()"
            [animationEasing]="animationEasing()"
          />
        }
        <svg:g ngx-sector
          [cx]="resolvedCx()"
          [cy]="resolvedCy()"
          [innerRadius]="bar.innerRadius"
          [outerRadius]="bar.outerRadius"
          [startAngle]="bar.startAngle"
          [endAngle]="bar.endAngle"
          [cornerRadius]="cornerRadius()"
          [fill]="bar.fill"
          [stroke]="stroke()"
          [isAnimationActive]="isAnimationActive()"
          [animationBegin]="animationBegin()"
          [animationDuration]="animationDuration()"
          [animationEasing]="animationEasing()"
        />
      }
    }
  `,
})
export class RadialBarComponent implements OnDestroy {
  private readonly polarService = inject(PolarCoordinateService, { optional: true });
  private readonly registryService = inject(GraphicalItemRegistryService, { optional: true });
  private readonly chartDataService = inject(ChartDataService, { optional: true });

  private static nextId = 0;
  private readonly itemId = `radialBar-${RadialBarComponent.nextId++}`;

  constructor() {
    effect(() => {
      this.registryService?.replace(this.itemId, {
        id: this.itemId,
        type: 'radialBar',
        dataKey: this.dataKey(),
        name: this.name(),
        fill: this.fill(),
        hide: this.hide(),
      });
    });
  }

  ngOnDestroy(): void {
    this.registryService?.unregister(this.itemId);
  }

  dataKey = input.required<string>();
  data = input<any[]>([]);
  name = input<string>('');
  cx = input<number | undefined>(undefined);
  cy = input<number | undefined>(undefined);
  minAngle = input<number>(0);
  legendType = input<string>('rect');
  label = input<boolean>(false);
  background = input<boolean>(false);
  forceCornerRadius = input<boolean>(false);
  cornerRadius = input<number>(0);
  cornerIsExternal = input<boolean>(false);
  fill = input<string>('#8884d8');
  stroke = input<string>('none');
  hide = input<boolean>(false);

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  resolvedCx = computed(() => this.cx() ?? this.polarService?.cx() ?? 0);
  resolvedCy = computed(() => this.cy() ?? this.polarService?.cy() ?? 0);

  private resolvedOuterRadius = computed(() => this.polarService?.outerRadius() ?? 100);
  private resolvedInnerRadius = computed(() => this.polarService?.innerRadius() ?? 0);

  resolvedData = computed(() => {
    const explicit = this.data();
    return explicit.length > 0 ? explicit : (this.chartDataService?.data() ?? []);
  });

  bars = computed((): RadialBarEntry[] => {
    const data = this.resolvedData();
    const dataKey = this.dataKey();
    const outerRadius = this.resolvedOuterRadius();
    const innerRadius = this.resolvedInnerRadius();
    const minAngle = this.minAngle();
    const fill = this.fill();

    if (!data.length) return [];

    const barCount = data.length;
    const barThickness = (outerRadius - innerRadius) / barCount;
    const gap = barThickness * 0.1;

    const maxValue = Math.max(...data.map(d => Number(d[dataKey]) || 0));

    return data.map((d, i) => {
      const value = Number(d[dataKey]) || 0;
      const barInnerRadius = innerRadius + i * barThickness;
      const barOuterRadius = barInnerRadius + barThickness - gap;
      const endAngle = maxValue > 0 ? (value / maxValue) * 360 : 0;

      return {
        innerRadius: barInnerRadius,
        outerRadius: barOuterRadius,
        startAngle: 0,
        endAngle: Math.max(endAngle, minAngle),
        fill: d['fill'] ?? fill,
        name: d['name'] ?? String(i),
        value,
      };
    });
  });
}
