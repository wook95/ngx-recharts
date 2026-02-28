import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Data-only component for customizing individual cells/sectors in charts.
 * Parent components (Pie, Treemap, Funnel) query cells using:
 *   cells = contentChildren(CellComponent);
 * Each Cell's fill/stroke overrides the parent's default for that data index.
 */
@Component({
  selector: 'ngx-cell',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
  styles: []
})
export class CellComponent {
  fill = input<string>();
  stroke = input<string>();
  strokeWidth = input<number>();
  opacity = input<number>();
  className = input<string>('');
}
