import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'svg:g[ngx-layer]',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<svg:g [attr.class]="className()"><ng-content /></svg:g>`,
})
export class LayerComponent {
  className = input<string>('');
}
