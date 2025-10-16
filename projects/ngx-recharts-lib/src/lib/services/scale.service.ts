import { Injectable } from '@angular/core';
import { scaleLinear, scaleBand, scaleTime, ScaleLinear, ScaleBand, ScaleTime } from 'd3-scale';
import { ChartData, getNumericDataValue } from '../core/types';

export type Scale = ScaleLinear<number, number> | ScaleBand<string> | ScaleTime<number, number>;

@Injectable({
  providedIn: 'root'
})
export class ScaleService {

  createLinearScale(domain: [number, number], range: [number, number]): ScaleLinear<number, number> {
    return scaleLinear()
      .domain(domain)
      .range(range);
  }

  createBandScale(domain: string[], range: [number, number]): ScaleBand<string> {
    return scaleBand()
      .domain(domain)
      .range(range)
      .padding(0.1);
  }

  createTimeScale(domain: [Date, Date], range: [number, number]): ScaleTime<number, number> {
    return scaleTime()
      .domain(domain)
      .range(range);
  }

  // Extract domain from data
  getLinearDomain(data: ChartData[], dataKey: string): [number, number] {
    const values = data.map(item => getNumericDataValue(item, dataKey));
    return [Math.min(...values), Math.max(...values)];
  }

  getCategoryDomain(data: ChartData[], dataKey: string): string[] {
    return data.map(item => String(item[dataKey] || ''));
  }

  // Generate ticks for axes
  generateLinearTicks(scale: ScaleLinear<number, number>, count: number = 5) {
    return scale.ticks(count).map(value => ({
      value,
      coordinate: scale(value)
    }));
  }

  generateBandTicks(scale: ScaleBand<string>) {
    return scale.domain().map(value => ({
      value,
      coordinate: (scale(value) || 0) + scale.bandwidth() / 2
    }));
  }
}