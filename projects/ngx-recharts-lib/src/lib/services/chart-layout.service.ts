import { Injectable, signal, computed, inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { selectWidth, selectHeight, selectOffset, selectPlotArea } from '../store/chart.state';

@Injectable({
  providedIn: 'root'
})
export class ChartLayoutService {
  private store = inject(Store);
  
  // Signals from store
  readonly width = signal(0);
  readonly height = signal(0);
  readonly offset = signal({ top: 0, bottom: 0, left: 0, right: 0 });
  
  // Computed properties for compatibility
  readonly chartWidth = computed(() => this.width());
  readonly chartHeight = computed(() => this.height());
  readonly margin = computed(() => this.offset());
  
  // Computed plot area
  readonly plotArea = computed(() => {
    const w = this.width();
    const h = this.height();
    const o = this.offset();
    
    if (w === 0 || h === 0) return null;
    
    return {
      width: w - o.left - o.right,
      height: h - o.top - o.bottom,
      x: o.left,
      y: o.top
    };
  });
  
  constructor() {
    // Subscribe to store changes and update signals
    this.store.select(selectWidth).subscribe(width => this.width.set(width));
    this.store.select(selectHeight).subscribe(height => this.height.set(height));
    this.store.select(selectOffset).subscribe(offset => this.offset.set(offset));
  }
}