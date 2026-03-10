# ngx-recharts

Angular port of [Recharts](https://recharts.org/). Composable chart components built with Angular signals, D3, and SVG.

Not a wrapper — a full rewrite targeting Angular 19+ with native patterns (signals, dependency injection, standalone components).

## Installation

```bash
npm install ngx-recharts-lib
```

## Quick Start

```typescript
import {
  LineChartComponent, LineComponent,
  XAxisComponent, YAxisComponent, CartesianGridComponent
} from 'ngx-recharts-lib';

@Component({
  imports: [LineChartComponent, LineComponent, XAxisComponent, YAxisComponent, CartesianGridComponent],
  template: `
    <ngx-line-chart [data]="data" [width]="600" [height]="400">
      <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
      <svg:g ngx-x-axis dataKey="name"></svg:g>
      <svg:g ngx-y-axis></svg:g>
      <svg:g ngx-line dataKey="uv" stroke="#8884d8"></svg:g>
      <svg:g ngx-line dataKey="pv" stroke="#82ca9d"></svg:g>
    </ngx-line-chart>
  `,
})
export class MyComponent {
  data = [
    { name: 'Page A', uv: 4000, pv: 2400 },
    { name: 'Page B', uv: 3000, pv: 1398 },
    { name: 'Page C', uv: 2000, pv: 9800 },
    { name: 'Page D', uv: 2780, pv: 3908 },
  ];
}
```

## Supported Charts

### Cartesian Charts

#### Line Chart

```html
<ngx-line-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-line dataKey="uv" stroke="#8884d8"></svg:g>
  <ngx-legend></ngx-legend>
</ngx-line-chart>
```

#### Bar Chart

```html
<ngx-bar-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-bar dataKey="uv" fill="#8884d8"></svg:g>
  <svg:g ngx-bar dataKey="pv" fill="#82ca9d"></svg:g>
</ngx-bar-chart>
```

#### Area Chart

```html
<ngx-area-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-area dataKey="uv" type="monotone" stroke="#8884d8" fill="#8884d8"></svg:g>
</ngx-area-chart>
```

#### Composed Chart

Mix Line, Bar, and Area in a single chart.

```html
<ngx-composed-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-area dataKey="amt" fill="#8884d8" stroke="#8884d8"></svg:g>
  <svg:g ngx-bar dataKey="pv" fill="#82ca9d"></svg:g>
  <svg:g ngx-line dataKey="uv" stroke="#ff7300"></svg:g>
</ngx-composed-chart>
```

#### Scatter Chart

```html
<ngx-scatter-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
  <svg:g ngx-x-axis [data]="data" dataKey="x" type="number"></svg:g>
  <svg:g ngx-y-axis [data]="data" dataKey="y" type="number"></svg:g>
  <svg:g ngx-scatter [data]="data" [dataKey]="{ x: 'x', y: 'y' }" fill="#8884d8"></svg:g>
</ngx-scatter-chart>
```

### Polar Charts

#### Pie Chart

```html
<ngx-pie-chart [data]="data" [width]="400" [height]="400">
  <svg:g ngx-pie [data]="data" dataKey="value" nameKey="name"
    [outerRadius]="80" fill="#8884d8" [label]="true">
  </svg:g>
</ngx-pie-chart>
```

Donut chart — add `[innerRadius]`:

```html
<svg:g ngx-pie [data]="data" dataKey="value"
  [innerRadius]="60" [outerRadius]="80" [paddingAngle]="5">
</svg:g>
```

#### Radar Chart

```html
<ngx-radar-chart [data]="data" [width]="500" [height]="500"
  cx="50%" cy="50%" [outerRadius]="'80%'">
  <svg:g ngx-polar-grid></svg:g>
  <svg:g ngx-polar-angle-axis dataKey="subject"></svg:g>
  <svg:g ngx-polar-radius-axis></svg:g>
  <svg:g ngx-radar dataKey="A" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
</ngx-radar-chart>
```

#### Radial Bar Chart

```html
<ngx-radial-bar-chart [data]="data" [width]="500" [height]="500"
  [innerRadius]="'10%'" [outerRadius]="'80%'">
  <svg:g ngx-radial-bar dataKey="uv" fill="#8884d8"></svg:g>
</ngx-radial-bar-chart>
```

### Specialized Charts

#### Funnel Chart

```html
<ngx-funnel-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-funnel [data]="data" dataKey="value" nameKey="name" fill="#8884d8"></svg:g>
</ngx-funnel-chart>
```

#### Treemap

```html
<ngx-treemap [data]="data" dataKey="size" nameKey="name" [width]="600" [height]="400"></ngx-treemap>
```

#### Sankey / Sunburst

Also available — see [Storybook](https://github.com/wook95/ngx-recharts) for examples.

## Components

| Category | Components |
|---|---|
| Charts | LineChart, BarChart, AreaChart, ComposedChart, ScatterChart, PieChart, RadarChart, RadialBarChart, FunnelChart, Treemap, Sankey, SunburstChart |
| Cartesian | Line, Bar, Area, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Brush, ReferenceLine, ReferenceArea, ReferenceDot, ErrorBar |
| Polar | Pie, Radar, RadialBar, PolarGrid, PolarAngleAxis, PolarRadiusAxis |
| UI | Tooltip, Legend, ResponsiveContainer, Label, LabelList, Cell |
| Shapes | Rectangle, Sector, Curve, Dot, Cross, Polygon, Trapezoid, Symbols |

## Development Status

See [milestones](https://github.com/wook95/ngx-recharts/milestones) for the full roadmap.

- **v0.1** — Core stability, packaging, bug fixes
- **v0.2** — Feature parity (animation, custom rendering, chart sync)
- **v1.0** — Production ready (test coverage, beautiful defaults)

## Contributing

Check [open issues](https://github.com/wook95/ngx-recharts/issues) — issues tagged `good first issue` are a good starting point.

## License

MIT
