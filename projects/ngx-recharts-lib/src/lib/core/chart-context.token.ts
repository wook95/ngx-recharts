import { InjectionToken } from '@angular/core';
import { TooltipService } from '../services/tooltip.service';

export const CHART_TOOLTIP_SERVICE = new InjectionToken<TooltipService>('CHART_TOOLTIP_SERVICE');