import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
} from '@angular/core';
import {
  symbol,
  symbolCircle,
  symbolCross,
  symbolDiamond,
  symbolSquare,
  symbolStar,
  symbolTriangle,
  symbolWye,
} from 'd3-shape';

export type SymbolType = 'circle' | 'cross' | 'diamond' | 'square' | 'star' | 'triangle' | 'wye';

@Component({
  selector: 'svg:g[ngx-symbols]',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg:path
      [class]="className()"
      [attr.d]="symbolPath()"
      [attr.fill]="fill()"
      [attr.stroke]="stroke()"
      [attr.stroke-width]="strokeWidth()"
      [attr.transform]="transform()"
      [style]="animationStyle()"
      (click)="symbolClick.emit($event)"
      (mouseenter)="symbolMouseEnter.emit($event)"
      (mouseleave)="symbolMouseLeave.emit($event)" />
  `,
})
export class SymbolsComponent {
  type = input<SymbolType>('circle');
  size = input<number>(64);
  cx = input<number>(0);
  cy = input<number>(0);
  fill = input<string>('#ccc');
  stroke = input<string>('none');
  strokeWidth = input<number>(1);
  className = input<string>('');

  // Animation inputs
  isAnimationActive = input<boolean>(true);
  animationBegin = input<number>(0);
  animationDuration = input<number>(300);
  animationEasing = input<string>('ease');

  animationStyle = computed(() => {
    if (!this.isAnimationActive()) return {};
    const delay = `${this.animationBegin()}ms`;
    const duration = `${this.animationDuration()}ms`;
    const easing = this.animationEasing();
    return { transition: `all ${duration} ${easing} ${delay}` };
  });

  symbolClick = output<MouseEvent>();
  symbolMouseEnter = output<MouseEvent>();
  symbolMouseLeave = output<MouseEvent>();

  private d3SymbolType = computed(() => {
    switch (this.type()) {
      case 'cross':    return symbolCross;
      case 'diamond':  return symbolDiamond;
      case 'square':   return symbolSquare;
      case 'star':     return symbolStar;
      case 'triangle': return symbolTriangle;
      case 'wye':      return symbolWye;
      case 'circle':
      default:         return symbolCircle;
    }
  });

  symbolPath = computed(() => {
    const path = symbol().type(this.d3SymbolType()).size(this.size())();
    return path ?? '';
  });

  transform = computed(() => `translate(${this.cx()}, ${this.cy()})`);
}
