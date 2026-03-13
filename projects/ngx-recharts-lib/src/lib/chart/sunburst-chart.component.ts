import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { hierarchy, partition } from 'd3-hierarchy';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { SectorComponent } from '../shape/sector.component';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const DEPTH_COLORS = [
  ['#8884d8', '#a29bfe', '#6c5ce7', '#5a4fcf', '#4834d4'],
  ['#82ca9d', '#55efc4', '#00b894', '#00cec9', '#0984e3'],
  ['#ffc658', '#fdcb6e', '#e17055', '#d63031', '#e84393'],
  ['#ff7300', '#fd79a8', '#e84393', '#6c5ce7', '#00cec9'],
];

@Component({
  selector: 'ngx-sunburst-chart',
  standalone: true,
  imports: [SectorComponent],
  providers: [ResponsiveContainerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="actualWidth()" [attr.height]="actualHeight()">
      <svg:g [attr.transform]="'translate(' + resolvedCx() + ',' + resolvedCy() + ')'">
        @for (sector of sectors(); track $index) {
          <svg:g ngx-sector
            [cx]="0"
            [cy]="0"
            [innerRadius]="sector.innerRadius"
            [outerRadius]="sector.outerRadius"
            [startAngle]="sector.startAngle * 180 / Math.PI"
            [endAngle]="sector.endAngle * 180 / Math.PI"
            [fill]="sector.fill"
            [stroke]="stroke()"
            [strokeWidth]="strokeWidth()"
          />
        }
      </svg:g>
    </svg>
  `,
})
export class SunburstChartComponent {
  readonly Math = Math;

  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  data = input<any>(null);
  dataKey = input<string>('value');
  nameKey = input<string>('name');
  cx = input<number | undefined>(undefined);
  cy = input<number | undefined>(undefined);
  innerRadius = input<number>(0);
  outerRadius = input<number | undefined>(undefined);
  width = input<number>(400);
  height = input<number>(400);
  fill = input<string>('#8884d8');
  stroke = input<string>('#fff');
  strokeWidth = input<number>(1);

  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });
  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });

  resolvedCx = computed(() => this.cx() ?? this.width() / 2);
  resolvedCy = computed(() => this.cy() ?? this.height() / 2);

  private resolvedOuterRadius = computed(() =>
    this.outerRadius() ?? Math.min(this.width(), this.height()) / 2 - 10
  );

  sectors = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const nameKey = this.nameKey();
    const innerRadius = this.innerRadius();
    const outerRadius = this.resolvedOuterRadius();

    if (!data) return [];

    const root = hierarchy(data)
      .sum((d: any) => d[dataKey] ?? 0)
      .sort((a: any, b: any) => (b.value || 0) - (a.value || 0));

    partition()(root);

    const xScale = scaleLinear().domain([0, 1]).range([0, 2 * Math.PI]);
    const yScale = scaleSqrt().domain([0, 1]).range([innerRadius, outerRadius]);

    return root.descendants()
      .filter((d: any) => d.depth > 0)
      .map((d: any, i: number) => ({
        startAngle: xScale((d as any).x0),
        endAngle: xScale((d as any).x1),
        innerRadius: yScale((d as any).y0),
        outerRadius: yScale((d as any).y1),
        fill: this.colorForDepth(d.depth, i),
        name: (d.data as any)[nameKey],
        value: d.value,
      }));
  });

  private colorForDepth(depth: number, index: number): string {
    const palette = DEPTH_COLORS[(depth - 1) % DEPTH_COLORS.length];
    return palette[index % palette.length];
  }
}
