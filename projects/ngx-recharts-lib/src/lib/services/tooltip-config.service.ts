import { Injectable, signal } from '@angular/core';
import { TooltipConfig } from '../core/tooltip-types';

@Injectable()
export class TooltipConfigService {
  private _config = signal<TooltipConfig>({});
  
  config = this._config.asReadonly();
  
  setConfig(config: TooltipConfig) {
    this._config.set(config);
  }
}