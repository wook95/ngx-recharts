# NGX Recharts

Angular port of the [Recharts](https://recharts.org/) library. Build composable charts with Angular components using the same API as Recharts.

## Installation

```bash
npm install ngx-recharts
```

## Quick Start

```typescript
import { BarChartComponent, BarComponent, XAxisComponent, YAxisComponent, CartesianGridComponent } from "ngx-recharts";

@Component({
  imports: [BarChartComponent, BarComponent, XAxisComponent, YAxisComponent, CartesianGridComponent],
  template: `
    <ngx-bar-chart [data]="data" [width]="600" [height]="400">
      <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
      <svg:g ngx-x-axis dataKey="name"></svg:g>
      <svg:g ngx-y-axis></svg:g>
      <svg:g ngx-bar dataKey="value" fill="#8884d8"></svg:g>
    </ngx-bar-chart>
  `,
})
export class MyComponent {
  data = [
    { name: "Page A", value: 4000 },
    { name: "Page B", value: 3000 },
    { name: "Page C", value: 2000 },
  ];
}
```

## Supported Charts

### Line Chart

```html
<ngx-line-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid></svg:g>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-line dataKey="value" stroke="#8884d8"></svg:g>
</ngx-line-chart>
```

### Bar Chart

```html
<ngx-bar-chart [data]="data" [width]="600" [height]="400">
  <svg:g ngx-cartesian-grid></svg:g>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-bar dataKey="uv" fill="#8884d8"></svg:g>
  <svg:g ngx-bar dataKey="pv" fill="#82ca9d"></svg:g>
</ngx-bar-chart>
```

### Area Chart with Gradients

```html
<ngx-area-chart [data]="data" [width]="600" [height]="400">
  <svg:defs>
    <svg:linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
      <svg:stop offset="5%" stop-color="#8884d8" stop-opacity="0.8"></svg:stop>
      <svg:stop offset="95%" stop-color="#8884d8" stop-opacity="0"></svg:stop>
    </svg:linearGradient>
  </svg:defs>
  <svg:g ngx-x-axis dataKey="name"></svg:g>
  <svg:g ngx-y-axis></svg:g>
  <svg:g ngx-area dataKey="uv" type="monotone" stroke="#8884d8" fill="url(#colorUv)"></svg:g>
</ngx-area-chart>
```

## Architecture

- **Chart Components**: `LineChart`, `BarChart`, `AreaChart`
- **Cartesian Components**: `Line`, `Bar`, `Area`, `XAxis`, `YAxis`, `CartesianGrid`
- **Interactive Components**: `Tooltip`, `ResponsiveContainer`
- **Services**: `ScaleService` (D3 scales), `TooltipService` (tooltip state)

## Development Status

- ✅ Line, Bar, Area Charts
- ✅ D3 Scale Integration
- ✅ Interactive Tooltips
- ✅ SVG Gradients
- ✅ Curve Interpolation
- 🔄 Pie Charts (coming soon)
- 🔄 Legend System (coming soon)
- 🔄 Animation System (coming soon)

## License

MIT
