import { Injectable, signal, Signal } from '@angular/core';
import { CartesianViewBox, PolarViewBox, TrapezoidViewBox } from '../core/label-types';

/**
 * Service for providing Label context (viewBox) to child Label components
 */
@Injectable()
export class CartesianLabelContextService {
  private viewBoxSignal = signal<TrapezoidViewBox | undefined>(undefined);

  setViewBox(viewBox: TrapezoidViewBox | undefined): void {
    this.viewBoxSignal.set(viewBox);
  }

  getViewBox(): Signal<TrapezoidViewBox | undefined> {
    return this.viewBoxSignal.asReadonly();
  }
}

/**
 * Service for providing Polar Label context to child Label components
 */
@Injectable()
export class PolarLabelContextService {
  private viewBoxSignal = signal<PolarViewBox | undefined>(undefined);

  setViewBox(viewBox: PolarViewBox | undefined): void {
    this.viewBoxSignal.set(viewBox);
  }

  getViewBox(): Signal<PolarViewBox | undefined> {
    return this.viewBoxSignal.asReadonly();
  }
}
