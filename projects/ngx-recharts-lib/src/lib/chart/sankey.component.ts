import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { sankey, sankeyLinkHorizontal, SankeyNode, SankeyLink } from 'd3-sankey';
import { RectangleComponent } from '../shape/rectangle.component';

export interface SankeyData {
  nodes: { name: string }[];
  links: { source: number; target: number; value: number }[];
}

interface SankeyNodeProcessed extends SankeyNode<{ name: string }, { source: number; target: number; value: number }> {
  name: string;
  fill?: string;
}

interface SankeyLinkProcessed extends SankeyLink<{ name: string }, { source: number; target: number; value: number }> {
  path: string;
  width: number;
}

@Component({
  selector: 'ngx-sankey',
  standalone: true,
  imports: [RectangleComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="width()" [attr.height]="height()">
      <!-- Links -->
      @for (link of sankeyLinks(); track $index) {
        <svg:path
          [attr.d]="link.path"
          [attr.fill]="'none'"
          [attr.stroke]="'#000'"
          [attr.stroke-opacity]="0.2"
          [attr.stroke-width]="link.width"
        />
      }
      <!-- Nodes -->
      @for (node of sankeyNodes(); track $index) {
        <svg:g ngx-rectangle
          [x]="node.x0!"
          [y]="node.y0!"
          [width]="node.x1! - node.x0!"
          [height]="node.y1! - node.y0!"
          [fill]="node.fill || fill()"
          [stroke]="stroke()"
        />
        <svg:text
          [attr.x]="node.x0! < width() / 2 ? node.x1! + 6 : node.x0! - 6"
          [attr.y]="(node.y0! + node.y1!) / 2"
          [attr.text-anchor]="node.x0! < width() / 2 ? 'start' : 'end'"
          dominant-baseline="central"
          font-size="12">
          {{ node.name }}
        </svg:text>
      }
    </svg>
  `,
})
export class SankeyComponent {
  data = input<SankeyData>({ nodes: [], links: [] });
  width = input<number>(600);
  height = input<number>(400);
  margin = input<{ top: number; right: number; bottom: number; left: number }>({
    top: 5,
    right: 5,
    bottom: 5,
    left: 5,
  });
  nodeWidth = input<number>(10);
  nodePadding = input<number>(10);
  linkCurvature = input<number>(0.5);
  iterations = input<number>(6);
  nameKey = input<string>('name');
  fill = input<string>('#77c878');
  stroke = input<string>('#333');

  private layout = computed(() => {
    const margin = this.margin();
    const width = this.width();
    const height = this.height();

    const sankeyGenerator = sankey<{ name: string }, { source: number; target: number; value: number }>()
      .nodeWidth(this.nodeWidth())
      .nodePadding(this.nodePadding())
      .extent([
        [margin.left, margin.top],
        [width - margin.right, height - margin.bottom],
      ])
      .iterations(this.iterations());

    const d = this.data();
    return sankeyGenerator({
      nodes: d.nodes.map(n => ({ ...n })),
      links: d.links.map(l => ({ ...l })),
    });
  });

  sankeyNodes = computed<SankeyNodeProcessed[]>(() => {
    const key = this.nameKey();
    return this.layout().nodes.map(n => ({
      ...n,
      name: (n as unknown as Record<string, unknown>)[key] as string,
    })) as SankeyNodeProcessed[];
  });

  sankeyLinks = computed<SankeyLinkProcessed[]>(() => {
    const pathGen = sankeyLinkHorizontal();
    return this.layout().links.map(link => ({
      ...link,
      path: pathGen(link) ?? '',
      width: Math.max(1, (link as any).width ?? 1),
    })) as SankeyLinkProcessed[];
  });
}
