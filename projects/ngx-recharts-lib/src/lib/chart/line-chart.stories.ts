import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { LineChartComponent } from './line-chart.component';
import { LineComponent } from '../cartesian/line.component';
import { XAxisComponent } from '../cartesian/x-axis.component';
import { YAxisComponent } from '../cartesian/y-axis.component';
import { CartesianGridComponent } from '../cartesian/cartesian-grid.component';
import { LegendComponent } from '../component/legend.component';
import { ResponsiveContainerComponent } from '../component/responsive-container.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const pageData = [
  { name: 'Page A', uv: 4000, pv: 2400, amt: 2400 },
  { name: 'Page B', uv: 3000, pv: 1398, amt: 2210 },
  { name: 'Page C', uv: 2000, pv: 9800, amt: 2290 },
  { name: 'Page D', uv: 2780, pv: 3908, amt: 2000 },
  { name: 'Page E', uv: 1890, pv: 4800, amt: 2181 },
  { name: 'Page F', uv: 2390, pv: 3800, amt: 2500 },
  { name: 'Page G', uv: 3490, pv: 4300, amt: 2100 },
];

const meta: Meta<LineChartComponent> = {
  title: 'Charts/LineChart',
  component: LineChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        LineComponent,
        XAxisComponent,
        YAxisComponent,
        CartesianGridComponent,
        LegendComponent,
        ResponsiveContainerComponent,
      ],
      providers: [
        TooltipService,
        ResponsiveContainerService,
      ],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    data: { control: 'object' },
    width: { control: { type: 'number', min: 200, max: 1200 } },
    height: { control: { type: 'number', min: 200, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<LineChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-line-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'line'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#8884d8"></svg:g>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const MultipleLines: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-line-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'line'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#8884d8"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="pv" stroke="#82ca9d"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="amt" stroke="#ffc658"></svg:g>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const WithCustomMargin: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-line-chart
        [data]="data"
        [width]="width"
        [height]="height"
        [margin]="{ top: 20, right: 30, bottom: 20, left: 30 }">
        <svg:g ngx-cartesian-grid strokeDasharray="3 3"></svg:g>
        <svg:g ngx-x-axis [data]="data" dataKey="name" [chartType]="'line'" [label]="'Categories'"></svg:g>
        <svg:g ngx-y-axis [data]="data" dataKey="uv" [label]="'Values'"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="uv" stroke="#8884d8" [strokeWidth]="2"></svg:g>
        <svg:g ngx-line [data]="data" dataKey="pv" stroke="#82ca9d" [strokeWidth]="2"></svg:g>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 700,
    height: 450,
  },
};

export const CleanAPI: Story = {
  name: 'Clean API (No [data] on children)',
  render: (args) => ({
    props: args,
    template: `
      <ngx-line-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#8884d8"></svg:g>
        <svg:g ngx-line dataKey="pv" stroke="#82ca9d"></svg:g>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const UnifiedYDomain: Story = {
  name: 'Unified Y-Domain (default)',
  render: (args) => ({
    props: args,
    template: `
      <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
        yDomainMode="unified" — All lines share the same Y-axis scale (0–9800)
      </p>
      <ngx-line-chart [data]="data" [width]="width" [height]="height" yDomainMode="unified">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#8884d8" name="UV (100–4000)"></svg:g>
        <svg:g ngx-line dataKey="pv" stroke="#82ca9d" name="PV (1000–9800)"></svg:g>
        <ngx-legend></ngx-legend>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const IndependentYDomain: Story = {
  name: 'Independent Y-Domain',
  render: (args) => ({
    props: args,
    template: `
      <p style="font-size: 14px; color: #666; margin-bottom: 8px;">
        yDomainMode="independent" — Each line computes its own Y-axis scale
      </p>
      <ngx-line-chart [data]="data" [width]="width" [height]="height" yDomainMode="independent">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#8884d8" name="UV (100–4000)"></svg:g>
        <svg:g ngx-line dataKey="pv" stroke="#82ca9d" name="PV (1000–9800)"></svg:g>
        <ngx-legend></ngx-legend>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const WithAutoLegend: Story = {
  name: 'With Auto Legend',
  render: (args) => ({
    props: args,
    template: `
      <ngx-line-chart [data]="data" [width]="width" [height]="height">
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#8884d8" name="UV Data"></svg:g>
        <svg:g ngx-line dataKey="pv" stroke="#82ca9d" name="PV Data"></svg:g>
        <ngx-legend></ngx-legend>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};

export const Interactive: Story = {
  render: (args) => ({
    props: {
      ...args,
      onChartClick: (event: any) => console.log('Chart clicked:', event),
      onChartMouseMove: (event: any) => console.log('Mouse move:', event),
    },
    template: `
      <ngx-line-chart
        [data]="data"
        [width]="width"
        [height]="height"
        (chartClick)="onChartClick($event)"
        (chartMouseMove)="onChartMouseMove($event)"
      >
        <svg:g ngx-cartesian-grid [horizontal]="true" [vertical]="false"></svg:g>
        <svg:g ngx-x-axis dataKey="name"></svg:g>
        <svg:g ngx-y-axis></svg:g>
        <svg:g ngx-line dataKey="uv" stroke="#8884d8"></svg:g>
      </ngx-line-chart>
    `,
  }),
  args: {
    data: pageData,
    width: 600,
    height: 400,
  },
};
