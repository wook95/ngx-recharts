import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { hierarchy, partition } from 'd3-hierarchy';
import { scaleLinear, scaleSqrt } from 'd3-scale';
import { SectorComponent } from '../shape/sector.component';

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
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()">
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
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    partition()(root);

    const xScale = scaleLinear().domain([0, 1]).range([0, 2 * Math.PI]);
    const yScale = scaleSqrt().domain([0, 1]).range([innerRadius, outerRadius]);

    return root.descendants()
      .filter(d => d.depth > 0)
      .map((d, i) => ({
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
