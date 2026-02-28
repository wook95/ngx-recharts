import { Injectable, signal, computed } from '@angular/core';
import { ScaleBand } from 'd3-scale';

/**
 * Represents a graphical item (Line, Bar, Area, Scatter) registered in the chart.
 * Matches the recharts pattern where each graphical item registers itself.
 */
export interface GraphicalItemInfo {
  /** Unique identifier for this item */
  id: string;
  /** Type of graphical item */
  type: 'line' | 'bar' | 'area' | 'scatter' | 'pie' | 'radar' | 'radialBar' | 'funnel';
  /** Data key used to extract values from chart data */
  dataKey: string;
  /** Display name for legend/tooltip */
  name?: string;
  /** Stroke color (for Line, Area outline) */
  stroke?: string;
  /** Fill color (for Bar, Area fill) */
  fill?: string;
  /** X-axis ID this item is associated with */
  xAxisId?: string | number;
  /** Y-axis ID this item is associated with */
  yAxisId?: string | number;
  /** Whether this item is hidden */
  hide?: boolean;
  /** Stack ID for stacking bars/areas together */
  stackId?: string;
  /** Fill opacity */
  fillOpacity?: number;
  /** Stroke width */
  strokeWidth?: number;
}

/**
 * Service to manage graphical items in a chart.
 * 
 * This service follows the recharts pattern where each graphical item (Line, Bar, Area)
 * registers itself when mounted and unregisters when destroyed.
 * 
 * The registry enables:
 * - Automatic legend generation
 * - Dynamic tooltip payload creation
 * - Shared scale calculation across all items
 * 
 * @example
 * ```typescript
 * // In a graphical component (e.g., LineComponent)
 * export class LineComponent implements OnInit, OnDestroy {
 *   private registry = inject(GraphicalItemRegistryService, { optional: true });
 *   private static nextId = 0;
 *   private readonly itemId = `line-${LineComponent.nextId++}`;
 *   
 *   ngOnInit() {
 *     this.registry?.register({
 *       id: this.itemId,
 *       type: 'line',
 *       dataKey: this.dataKey(),
 *       stroke: this.stroke(),
 *     });
 *   }
 *   
 *   ngOnDestroy() {
 *     this.registry?.unregister(this.itemId);
 *   }
 * }
 * ```
 */
@Injectable()
export class GraphicalItemRegistryService {
  /** Internal signal holding all registered items */
  private readonly _items = signal<GraphicalItemInfo[]>([]);

  /** Read-only signal of all registered items */
  readonly items = this._items.asReadonly();

  /** Computed signal of visible items only */
  readonly visibleItems = computed(() => 
    this._items().filter(item => !item.hide)
  );

  /** Computed signal of all unique data keys */
  readonly dataKeys = computed(() =>
    [...new Set(this._items().map(item => item.dataKey))]
  );

  /** Band scale set by ChartContainerComponent when bars are present */
  private readonly _bandScale = signal<ScaleBand<string> | null>(null);
  readonly bandScale = this._bandScale.asReadonly();

  /** Whether the chart should use band-based positioning */
  readonly hasBars = computed(() => this.getItemsByType('bar').length > 0);

  /** Category key used to look up the x-axis category in each data record */
  private readonly _categoryKey = signal<string>('name');
  readonly categoryKey = this._categoryKey.asReadonly();

  /** Set the category key (called by ChartContainerComponent) */
  setCategoryKey(key: string): void {
    this._categoryKey.set(key);
  }

  /** Set the band scale (called by ChartContainerComponent) */
  setBandScale(scale: ScaleBand<string> | null): void {
    this._bandScale.set(scale);
  }

  /**
   * Register a new graphical item.
   * Called when a graphical component is initialized.
   */
  register(item: GraphicalItemInfo): void {
    this._items.update(items => {
      // Prevent duplicates
      if (items.some(i => i.id === item.id)) {
        return items;
      }
      return [...items, item];
    });
  }

  /**
   * Update an existing graphical item.
   * Called when item properties change.
   */
  update(id: string, updates: Partial<GraphicalItemInfo>): void {
    this._items.update(items =>
      items.map(item => 
        item.id === id ? { ...item, ...updates } : item
      )
    );
  }

  /**
   * Replace an existing item or register new one.
   * Useful for components that re-render with new props.
   */
  replace(prevId: string, item: GraphicalItemInfo): void {
    this._items.update(items => {
      const index = items.findIndex(i => i.id === prevId);
      if (index >= 0) {
        const newItems = [...items];
        newItems[index] = item;
        return newItems;
      }
      return [...items, item];
    });
  }

  /**
   * Unregister a graphical item.
   * Called when a graphical component is destroyed.
   */
  unregister(id: string): void {
    this._items.update(items => items.filter(i => i.id !== id));
  }

  /**
   * Get items associated with a specific Y-axis.
   */
  getItemsByYAxisId(axisId: string | number): GraphicalItemInfo[] {
    return this._items().filter(i => 
      i.yAxisId === axisId || (i.yAxisId === undefined && axisId === 0)
    );
  }

  /**
   * Get items associated with a specific X-axis.
   */
  getItemsByXAxisId(axisId: string | number): GraphicalItemInfo[] {
    return this._items().filter(i => 
      i.xAxisId === axisId || (i.xAxisId === undefined && axisId === 0)
    );
  }

  /**
   * Get items grouped by stack ID.
   * Returns a map where key is stackId and value is array of items.
   */
  getStackedItems(): Map<string, GraphicalItemInfo[]> {
    const stacks = new Map<string, GraphicalItemInfo[]>();
    
    for (const item of this._items()) {
      if (item.stackId) {
        const existing = stacks.get(item.stackId) || [];
        stacks.set(item.stackId, [...existing, item]);
      }
    }
    
    return stacks;
  }

  /**
   * Get items by type.
   */
  getItemsByType(type: GraphicalItemInfo['type']): GraphicalItemInfo[] {
    return this._items().filter(i => i.type === type);
  }

  /**
   * Clear all registered items.
   */
  clear(): void {
    this._items.set([]);
  }

  /**
   * Generate tooltip payload for a data point.
   * @param data The chart data array
   * @param index The index of the data point
   */
  generateTooltipPayload(
    data: Record<string, unknown>[],
    index: number
  ): Array<{
    dataKey: string;
    value: number | string;
    name: string;
    color: string;
    payload: Record<string, unknown>;
  }> {
    const item = data[index];
    if (!item) return [];

    return this.visibleItems().map(graphicalItem => ({
      dataKey: graphicalItem.dataKey,
      value: item[graphicalItem.dataKey] as number | string,
      name: graphicalItem.name || graphicalItem.dataKey,
      color: graphicalItem.stroke || graphicalItem.fill || '#8884d8',
      payload: item,
    }));
  }

  /**
   * Generate legend payload from registered items.
   */
  generateLegendPayload(): Array<{
    value: string;
    type: string;
    color: string;
    dataKey: string;
  }> {
    return this.visibleItems().map(item => ({
      value: item.name || item.dataKey,
      type: this.getLegendShape(item.type),
      color: item.stroke || item.fill || '#8884d8',
      dataKey: item.dataKey,
    }));
  }

  private getLegendShape(type: GraphicalItemInfo['type']): string {
    const shapeMap: Record<string, string> = {
      'line': 'line',
      'bar': 'rect',
      'area': 'rect',
      'scatter': 'circle',
      'pie': 'rect',
      'radar': 'rect',
      'radialBar': 'rect',
      'funnel': 'rect',
    };
    return shapeMap[type] || 'rect';
  }
}
