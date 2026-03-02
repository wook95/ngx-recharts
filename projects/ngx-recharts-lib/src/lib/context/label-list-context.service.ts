import { Injectable, signal, Signal } from '@angular/core';
import { CartesianViewBox, PolarViewBox, TrapezoidViewBox } from '../core/label-types';

export interface BaseLabelListEntry {
  value: number | string | Array<number | string>;
  payload: any;
  fill?: string;
}

export interface CartesianLabelListEntry extends BaseLabelListEntry {
  viewBox: TrapezoidViewBox;
  parentViewBox?: CartesianViewBox;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface PolarLabelListEntry extends BaseLabelListEntry {
  viewBox: PolarViewBox;
  parentViewBox?: PolarViewBox;
  clockWise?: boolean;
}

export type LabelListEntry = CartesianLabelListEntry | PolarLabelListEntry;

/**
 * Service for providing Cartesian LabelList data to LabelList components
 */
@Injectable()
export class CartesianLabelListContextService {
  private entriesSignal = signal<CartesianLabelListEntry[]>([]);

  setEntries(entries: CartesianLabelListEntry[]): void {
    this.entriesSignal.set(entries);
  }

  getEntries(): Signal<CartesianLabelListEntry[]> {
    return this.entriesSignal.asReadonly();
  }
}

/**
 * Service for providing Polar LabelList data to LabelList components
 */
@Injectable()
export class PolarLabelListContextService {
  private entriesSignal = signal<PolarLabelListEntry[]>([]);

  setEntries(entries: PolarLabelListEntry[]): void {
    this.entriesSignal.set(entries);
  }

  getEntries(): Signal<PolarLabelListEntry[]> {
    return this.entriesSignal.asReadonly();
  }
}
