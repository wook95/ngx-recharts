import { Injectable, signal } from '@angular/core';
import { ChartData } from '../core/types';
import { TooltipPayload } from '../component/tooltip.component';

@Injectable()
export class TooltipService {
  // Tooltip state
  private _active = signal(false);
  private _payload = signal<TooltipPayload[]>([]);
  private _label = signal('');
  private _coordinate = signal({x: 0, y: 0});
  private _targetCoordinate = signal({x: 0, y: 0});
  private animationFrame?: number;
  
  // Public readonly signals
  readonly active = this._active.asReadonly();
  readonly payload = this._payload.asReadonly();
  readonly label = this._label.asReadonly();
  readonly coordinate = this._coordinate.asReadonly();
  
  showTooltip(
    coordinate: {x: number, y: number},
    payload: TooltipPayload[],
    label?: string
  ) {
    this._targetCoordinate.set(coordinate);
    this._payload.set(payload);
    this._label.set(label || '');
    this._active.set(true);
    
    // Smooth animation to target position
    this.animateToTarget();
  }
  
  private animateToTarget() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
    
    const animate = () => {
      const current = this._coordinate();
      const target = this._targetCoordinate();
      
      // Lerp with easing factor
      const factor = 0.15;
      const newX = current.x + (target.x - current.x) * factor;
      const newY = current.y + (target.y - current.y) * factor;
      
      this._coordinate.set({x: newX, y: newY});
      
      // Continue animation if not close enough
      const distance = Math.abs(target.x - newX) + Math.abs(target.y - newY);
      if (distance > 0.5) {
        this.animationFrame = requestAnimationFrame(animate);
      }
    };
    
    this.animationFrame = requestAnimationFrame(animate);
  }
  
  hideTooltip() {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = undefined;
    }
    this._active.set(false);
    this._payload.set([]);
    this._label.set('');
  }
  
  updatePosition(coordinate: {x: number, y: number}) {
    if (this._active()) {
      this._coordinate.set(coordinate);
    }
  }
}