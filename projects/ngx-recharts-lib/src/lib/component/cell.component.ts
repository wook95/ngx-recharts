import { Component, input } from '@angular/core';

/**
 * Cell component is used to customize individual cells in Pie, Treemap, and other charts.
 * It doesn't render anything by itself but provides data for parent components.
 */
@Component({
  selector: 'ngx-cell',
  standalone: true,
  template: '', // Cell doesn't render anything
  styles: []
})
export class CellComponent {
  // SVG properties
  fill = input<string>();
  stroke = input<string>();
  strokeWidth = input<number>();
  strokeDasharray = input<string>();
  
  // Custom properties
  name = input<string>();
  value = input<number>();
  
  // Any additional properties
  [key: string]: any;
}