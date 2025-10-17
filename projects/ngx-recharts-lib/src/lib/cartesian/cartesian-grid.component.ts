import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'svg:g[ngx-cartesian-grid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!-- Horizontal lines -->
    <!-- Background fill -->
    @if (fill()) {
    <svg:rect
      class="recharts-cartesian-grid-bg"
      [attr.x]="x()"
      [attr.y]="y()"
      [attr.width]="actualWidth()"
      [attr.height]="actualHeight()"
      [attr.fill]="fill()"
      [attr.fill-opacity]="fillOpacity() || 1"
    />
    }

    <!-- Horizontal lines -->
    @if (horizontal()) { @for (yCoord of computedHorizontalPoints(); track
    yCoord) {
    <svg:line
      class="recharts-cartesian-grid-horizontal"
      [attr.x1]="x()"
      [attr.y1]="yCoord"
      [attr.x2]="x() + actualWidth()"
      [attr.y2]="yCoord"
      [attr.stroke]="stroke()"
      [attr.stroke-dasharray]="strokeDasharray()"
      fill="none"
    />
    } }

    <!-- Vertical lines -->
    @if (vertical()) { @for (xCoord of computedVerticalPoints(); track xCoord) {
    <svg:line
      class="recharts-cartesian-grid-vertical"
      [attr.x1]="xCoord"
      [attr.y1]="y()"
      [attr.x2]="xCoord"
      [attr.y2]="y() + actualHeight()"
      [attr.stroke]="stroke()"
      [attr.stroke-dasharray]="strokeDasharray()"
      fill="none"
    />
    } }
  `,
})
export class CartesianGridComponent {
  private responsiveService = inject(ResponsiveContainerService, {
    optional: true,
  });

  // Recharts API inputs
  x = input<number>(0);
  y = input<number>(0);
  width = input<number>(0);
  height = input<number>(0);
  horizontal = input<boolean>(true);
  vertical = input<boolean>(true);
  horizontalPoints = input<number[]>([]);
  verticalPoints = input<number[]>([]);
  horizontalCoordinatesGenerator =
    input<
      (props: {
        yAxis?: any;
        width: number;
        height: number;
        offset?: any;
      }) => number[]
    >();
  verticalCoordinatesGenerator =
    input<
      (props: {
        xAxis?: any;
        width: number;
        height: number;
        offset?: any;
      }) => number[]
    >();
  fill = input<string>();
  fillOpacity = input<number>();
  strokeDasharray = input<string>('3 3');
  stroke = input<string>('#ccc');
  xAxisId = input<string | number>(0);
  yAxisId = input<string | number>(0);

  // Use plot area dimensions from responsive service
  actualWidth = computed(() => {
    const plotWidth = this.responsiveService?.plotWidth() ?? 0;
    const inputWidth = this.width();
    return plotWidth > 0 ? plotWidth : inputWidth > 0 ? inputWidth : 400;
  });

  actualHeight = computed(() => {
    const plotHeight = this.responsiveService?.plotHeight() ?? 0;
    const inputHeight = this.height();
    return plotHeight > 0 ? plotHeight : inputHeight > 0 ? inputHeight : 300;
  });

  // Computed grid coordinates
  computedHorizontalPoints = computed(() => {
    const generator = this.horizontalCoordinatesGenerator();
    const explicitPoints = this.horizontalPoints();
    const width = this.actualWidth();
    const height = this.actualHeight();

    if (generator) {
      return generator({ width, height });
    }

    if (explicitPoints.length > 0) {
      return explicitPoints;
    }

    // Default: 5 horizontal lines
    const points = [];
    for (let i = 1; i < 5; i++) {
      points.push((i * height) / 5);
    }
    return points;
  });

  computedVerticalPoints = computed(() => {
    const generator = this.verticalCoordinatesGenerator();
    const explicitPoints = this.verticalPoints();
    const width = this.actualWidth();
    const height = this.actualHeight();

    if (generator) {
      return generator({ width, height });
    }

    if (explicitPoints.length > 0) {
      return explicitPoints;
    }

    // Default: 5 vertical lines
    const points = [];
    for (let i = 1; i < 5; i++) {
      points.push((i * width) / 5);
    }
    return points;
  });
}
