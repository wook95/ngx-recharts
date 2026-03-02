/*
 * Public API Surface of ngx-recharts-lib
 */

// Core types
export * from './lib/core/types';

// Services
export * from './lib/services/animation.service';
export * from './lib/services/chart-dimension.service';
export * from './lib/services/chart-layout.service';
export * from './lib/services/scale.service';
export * from './lib/services/graphical-item-registry.service';
export * from './lib/services/axis-registry.service';
export * from './lib/services/axis-domain.service';
export * from './lib/services/axis-scale.service';
export * from './lib/services/chart-data.service';
export * from './lib/services/responsive-container.service';

// Chart Components
export * from './lib/chart/line-chart.component';
export * from './lib/chart/bar-chart.component';
export * from './lib/chart/area-chart.component';
export * from './lib/chart/composed-chart.component';
export * from './lib/chart/pie-chart.component';
export * from './lib/chart/radar-chart.component';
export * from './lib/chart/radial-bar-chart.component';
export * from './lib/chart/scatter-chart.component';
export * from './lib/chart/treemap.component';
export * from './lib/chart/funnel-chart.component';
export * from './lib/chart/sankey.component';
export * from './lib/chart/sunburst-chart.component';

// Cartesian Components
export * from './lib/cartesian/x-axis.component';
export * from './lib/cartesian/y-axis.component';
export * from './lib/cartesian/z-axis.component';
export * from './lib/cartesian/line.component';
export * from './lib/cartesian/bar.component';
export * from './lib/cartesian/bar-stack.component';
export * from './lib/cartesian/area.component';
export * from './lib/cartesian/scatter.component';
export * from './lib/cartesian/cartesian-axis.component';
export * from './lib/cartesian/cartesian-grid.component';
export * from './lib/cartesian/error-bar.component';
export * from './lib/cartesian/funnel.component';
export * from './lib/cartesian/reference-line.component';
export * from './lib/cartesian/reference-dot.component';
export * from './lib/cartesian/reference-area.component';
export * from './lib/cartesian/brush.component';

// Container Components
export * from './lib/container/surface.component';
export * from './lib/container/chart-container.component';
export * from './lib/container/recharts-wrapper.component';
export * from './lib/container/layer.component';
export * from './lib/container/z-index-layer';

// Component Components
export * from './lib/component/responsive-container.component';
export * from './lib/component/tooltip.component';
export * from './lib/component/legend.component';
export * from './lib/component/default-legend-content.component';
export * from './lib/component/default-tooltip-content.component';
export * from './lib/component/cell.component';
export * from './lib/component/text.component';
export { LabelComponent } from './lib/component/label.component';
export type { LabelPosition } from './lib/component/label.component';
export * from './lib/component/label-list.component';
export * from './lib/component/customized.component';

// Services
export * from './lib/services/tooltip.service';
export * from './lib/services/tooltip-state.service';
export * from './lib/services/polar-coordinate.service';
export * from './lib/services/tooltip-hit-test-strategy';
export * from './lib/services/cartesian-tooltip-strategy';
export * from './lib/services/polar-tooltip-strategy';

// Shape Components
export * from './lib/shape';

// Polar Components
export * from './lib/polar';

// Axis types
export * from './lib/core/axis-types';
export * from './lib/core/tooltip-types';
export * from './lib/core/chart-context.token';
export type {
  CartesianViewBox,
  TrapezoidViewBox,
  PolarViewBox,
  ViewBox as LabelViewBoxUnion
} from './lib/core/label-types';
export {
  isPolarViewBox,
  isTrapezoidViewBox,
  isCartesianViewBox,
  cartesianToTrapezoid
} from './lib/core/label-types';

// Context Services
export * from './lib/context/label-context.service';
export type {
  BaseLabelListEntry,
  CartesianLabelListEntry,
  PolarLabelListEntry,
  LabelListEntry as ContextLabelListEntry
} from './lib/context/label-list-context.service';
export {
  CartesianLabelListContextService,
  PolarLabelListContextService
} from './lib/context/label-list-context.service';

// Shared utilities
export { createChartDimensions } from './lib/shared/chart-dimensions';

// Utility functions
export * from './lib/util';