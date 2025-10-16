import {
  Component,
  input,
  computed,
  ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-cartesian-grid]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (!hide()) {
      <!-- Horizontal lines -->
      @if (horizontal()) {
        @for (y of horizontalPoints(); track y) {
          <svg:line
            class="recharts-cartesian-grid-horizontal"
            [attr.x1]="0"
            [attr.y1]="y"
            [attr.x2]="width()"
            [attr.y2]="y"
            [attr.stroke]="stroke()"
            [attr.stroke-dasharray]="strokeDasharray()"
            fill="none" />
        }
      }
      
      <!-- Vertical lines -->
      @if (vertical()) {
        @for (x of verticalPoints(); track x) {
          <svg:line
            class="recharts-cartesian-grid-vertical"
            [attr.x1]="x"
            [attr.y1]="0"
            [attr.x2]="x"
            [attr.y2]="height()"
            [attr.stroke]="stroke()"
            [attr.stroke-dasharray]="strokeDasharray()"
            fill="none" />
        }
      }
    }
  `
})
export class CartesianGridComponent {
  // Inputs
  width = input<number>(400);
  height = input<number>(300);
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
    const height = this.height();
    const points = [];
    
    for (let i = 0; i <= count; i++) {
      points.push((i * height) / count);
    }
    
    return points;
  });
  
  verticalPoints = computed(() => {
    const count = this.verticalCount();
    const width = this.width();
    const points = [];
    
    for (let i = 0; i <= count; i++) {
      points.push((i * width) / count);
    }
    
    return points;
  });
}