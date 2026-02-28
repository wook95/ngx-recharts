import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartLayoutService } from '../services/chart-layout.service';

@Component({
  selector: 'ngx-recharts-surface',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      #svgElement
      [attr.width]="width()"
      [attr.height]="height()"
      [attr.viewBox]="resolvedViewBox()"
      [style.width]="'100%'"
      [style.height]="'100%'"
      [style.display]="'block'"
      [class]="'recharts-surface' + (className() ? ' ' + className() : '')">
      @if (title()) {
        <svg:title>{{ title() }}</svg:title>
      }
      @if (desc()) {
        <svg:desc>{{ desc() }}</svg:desc>
      }
      <ng-content></ng-content>
    </svg>
  `,
  styles: [`
    .recharts-surface {
      overflow: hidden;
      display: block;
    }
  `]
})
export class SurfaceComponent {
  private layoutService = inject(ChartLayoutService, { optional: true });

  // Inputs using new signal-based inputs
  width = input<number>(0);
  height = input<number>(0);
  viewBox = input<string | undefined>(undefined);
  className = input<string>('');
  title = input<string | undefined>(undefined);
  desc = input<string | undefined>(undefined);

  // ViewChild using new signal-based viewChild
  svgElement = viewChild<ElementRef<SVGSVGElement>>('svgElement');

  // Computed viewBox — uses input override if provided, else auto-computed
  resolvedViewBox = computed(() => this.viewBox() ?? `0 0 ${this.width()} ${this.height()}`);

  // Output events
  dimensionsChange = output<{ width: number; height: number }>();

  constructor() {
    // Update layout service when dimensions change
    effect(() => {
      const w = this.width();
      const h = this.height();
      if (this.layoutService) {
        this.layoutService.setDimensions(w, h);
      }
    });
  }
}
