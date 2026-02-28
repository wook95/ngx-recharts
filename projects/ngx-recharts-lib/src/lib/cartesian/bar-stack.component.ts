import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

@Component({
  selector: 'svg:g[ngx-bar-stack]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:g [attr.class]="'ngx-bar-stack'">
      <ng-content />
    </svg:g>
  `
})
export class BarStackComponent {
  stackId = input<string>('stack-0');
}
