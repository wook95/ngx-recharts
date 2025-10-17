import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  inject,
} from '@angular/core';
import { ResponsiveContainerService } from '../services/responsive-container.service';

@Component({
  selector: 'svg:g[ngx-cartesian-grid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide()) {
      <!-- Horizontal lines -->
      @if (horizontal()) { @for (y of horizontalPoints(); track y) {
      <svg:line
        class="recharts-cartesian-grid-horizontal"
        [attr.x1]="0"
        [attr.y1]="y"
        [attr.x2]="actualWidth()"
        [attr.y2]="y"
        [attr.stroke]="stroke()"
        [attr.stroke-dasharray]="strokeDasharray()"
        fill="none"
      />
      } }

      <!-- Vertical lines -->
      @if (vertical()) { @for (x of verticalPoints(); track x) {
      <svg:line
        class="recharts-cartesian-grid-vertical"
        [attr.x1]="x"
        [attr.y1]="0"
        [attr.x2]="x"
        [attr.y2]="actualHeight()"
        [attr.stroke]="stroke()"
        [attr.stroke-dasharray]="strokeDasharray()"
        fill="none"
      />
      } }
    }
  `,
})
export class CartesianGridComponent {
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

  // Inputs
  width = input<number>(400);
  height = input<number>(300);

  // Use plot area dimensions from responsive service
  actualWidth = computed(() => {
    const plotWidth = this.responsiveService?.plotWidth() ?? 0;
    return plotWidth > 0 ? plotWidth : this.width();
  });
  
  actualHeight = computed(() => {
    const plotHeight = this.responsiveService?.plotHeight() ?? 0;
    return plotHeight > 0 ? plotHeight : this.height();
  });
  horizontal = input<boolean>(true);
  vertical = input<boolean>(true);
  stroke = input<string>('#ccc');
  strokeDasharray = input<string>('3 3');
  hide = input<boolean>(false);

  // Grid line counts
  horizontalCount = input<number>(5);
  verticalCount = input<number>(5);

  // Computed grid points
  horizontalPoints = computed(() => {
    const count = this.horizontalCount();
    const height = this.actualHeight();
    const points = [];

    for (let i = 0; i <= count; i++) {
      points.push((i * height) / count);
    }

    return points;
  });

  verticalPoints = computed(() => {
    const count = this.verticalCount();
    const width = this.actualWidth();
    const points = [];

    for (let i = 0; i <= count; i++) {
      points.push((i * width) / count);
    }

    return points;
  });
}
