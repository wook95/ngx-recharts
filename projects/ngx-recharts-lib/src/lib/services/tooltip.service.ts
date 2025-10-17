import { Injectable, signal } from '@angular/core';
import { TooltipPayload } from '../component/tooltip.component';

@Injectable()
export class TooltipService {
  // Tooltip state
  private _active = signal(false);
  private _payload = signal<TooltipPayload[]>([]);
  private _label = signal('');
  private _coordinate = signal({ x: 0, y: 0 });
  private _targetCoordinate = signal({ x: 0, y: 0 });
  private animationFrame?: number;

  // Public readonly signals
  readonly active = this._active.asReadonly();
  readonly payload = this._payload.asReadonly();
  readonly label = this._label.asReadonly();
  readonly coordinate = this._coordinate.asReadonly();

  showTooltip(
    coordinate: { x: number; y: number },
    payload: TooltipPayload[],
    label?: string
  ) {
    this._payload.set(payload);
    this._label.set(label || '');
    this._active.set(true);
    
    // Immediate position update (recharts style)
    this._coordinate.set(coordinate);
    this._targetCoordinate.set(coordinate);
  }

  // recharts uses CSS transitions instead of JS animation
  private animateToTarget() {
    // No longer needed - CSS handles animation
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

  updatePosition(coordinate: { x: number; y: number }) {
    if (this._active()) {
      // Only update Y position for smooth mouse following
      const current = this._coordinate();
      this._coordinate.set({
        x: current.x, // Keep X position fixed to data point
        y: coordinate.y // Update Y to follow mouse
      });
    }
  }
}
