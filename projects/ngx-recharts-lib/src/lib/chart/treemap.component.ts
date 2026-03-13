import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { hierarchy, treemap, treemapSquarify } from 'd3-hierarchy';
import { RectangleComponent } from '../shape/rectangle.component';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'ngx-treemap',
  standalone: true,
  imports: [RectangleComponent],
  providers: [ResponsiveContainerService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="actualWidth()" [attr.height]="actualHeight()" [attr.viewBox]="'0 0 ' + actualWidth() + ' ' + actualHeight()">
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

  private responsiveService = inject(ResponsiveContainerService, { optional: true });

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

  actualWidth = computed(() => {
    const responsiveWidth = this.responsiveService?.width() ?? 0;
    return responsiveWidth > 0 ? responsiveWidth : this.width();
  });
  actualHeight = computed(() => {
    const responsiveHeight = this.responsiveService?.height() ?? 0;
    return responsiveHeight > 0 ? responsiveHeight : this.height();
  });

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

    return root.leaves().map((leaf: any, i: number) => ({
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
