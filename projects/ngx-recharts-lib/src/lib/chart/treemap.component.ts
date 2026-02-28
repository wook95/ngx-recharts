import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { RectangleComponent } from '../shape/rectangle.component';

@Component({
  selector: 'ngx-treemap',
  standalone: true,
  imports: [RectangleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()" [attr.viewBox]="'0 0 ' + width() + ' ' + height()">
      @for (node of nodes(); track $index) {
        <svg:g ngx-rectangle
          [x]="node.x"
          [y]="node.y"
          [width]="node.width"
          [height]="node.height"
          [fill]="node.fill"
          [stroke]="stroke()"
          [strokeWidth]="strokeWidth()"
        />
        <svg:text
          [attr.x]="node.x + node.width / 2"
          [attr.y]="node.y + node.height / 2"
          text-anchor="middle"
          dominant-baseline="central"
          [attr.font-size]="Math.min(node.width, node.height) > 30 ? 12 : 0"
          fill="#fff">
          {{ node.name }}
        </svg:text>
      }
    </svg>
  `,
})
export class TreemapComponent {
  readonly Math = Math;

  data = input<any[]>([]);
  dataKey = input<string>('value');
  nameKey = input<string>('name');
  width = input<number>(400);
  height = input<number>(400);
  aspectRatio = input<number>(1 / Math.sqrt(2));
  type = input<'flat' | 'nest'>('flat');
  fill = input<string>('#8884d8');
  stroke = input<string>('#fff');
  strokeWidth = input<number>(1);
  colorPanel = input<string[]>([
    '#8889DD',
    '#9597E4',
    '#8DC77B',
    '#A5D297',
    '#E2CF45',
    '#F8C12D',
  ]);

  nodes = computed(() => {
    const data = this.data();
    const dataKey = this.dataKey();
    const nameKey = this.nameKey();
    const width = this.width();
    const height = this.height();
    const aspectRatio = this.aspectRatio();
    const colorPanel = this.colorPanel();

    if (!data || data.length === 0) return [];

    const root = hierarchy({ children: data } as any)
      .sum((d: any) => d[dataKey] ?? 0)
      .sort((a, b) => (b.value || 0) - (a.value || 0));

    const treemapLayout = treemap<any>()
      .size([width, height])
      .paddingOuter(2)
      .paddingInner(1)
      .tile(treemapSquarify.ratio(aspectRatio));

    treemapLayout(root);

    return root.leaves().map((leaf: any, i) => ({
      x: leaf.x0,
      y: leaf.y0,
      width: leaf.x1 - leaf.x0,
      height: leaf.y1 - leaf.y0,
      fill: colorPanel[i % colorPanel.length],
      name: (leaf.data as any)[nameKey],
      value: leaf.value,
    }));
  });
}
