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
import { ClipPathService } from '../services/clip-path.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

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
      @if (clipPathService?.shouldClip()) {
        <svg:defs>
          <svg:clipPath [attr.id]="clipPathService!.clipPathId">
            <svg:rect
              [attr.x]="clipX()"
              [attr.y]="clipY()"
              [attr.width]="clipWidth()"
              [attr.height]="clipHeight()"
            />
          </svg:clipPath>
        </svg:defs>
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
  clipPathService = inject(ClipPathService, { optional: true });
  private responsiveService = inject(ResponsiveContainerService, { optional: true });

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

  // Clip rect coordinates (absolute SVG coordinates)
  clipX = computed(() => this.responsiveService?.totalOffset().left ?? 0);
  clipY = computed(() => this.responsiveService?.totalOffset().top ?? 0);
  clipWidth = computed(() => this.responsiveService?.plotWidth() ?? this.width());
  clipHeight = computed(() => this.responsiveService?.plotHeight() ?? this.height());

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
