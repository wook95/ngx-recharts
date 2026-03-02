import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { RadarChartComponent } from './radar-chart.component';
import { RadarComponent } from '../polar/radar.component';
import { PolarGridComponent } from '../polar/polar-grid.component';
import { PolarAngleAxisComponent } from '../polar/polar-angle-axis.component';
import { PolarRadiusAxisComponent } from '../polar/polar-radius-axis.component';
import { TooltipService } from '../services/tooltip.service';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const radarData = [
  { subject: 'Math', A: 120, B: 110, fullMark: 150 },
  { subject: 'Chinese', A: 98, B: 130, fullMark: 150 },
  { subject: 'English', A: 86, B: 130, fullMark: 150 },
  { subject: 'Geography', A: 99, B: 100, fullMark: 150 },
  { subject: 'Physics', A: 85, B: 90, fullMark: 150 },
  { subject: 'History', A: 65, B: 85, fullMark: 150 },
];

const meta: Meta<RadarChartComponent> = {
  title: 'Charts/RadarChart',
  component: RadarChartComponent,
  decorators: [
    moduleMetadata({
      imports: [
        RadarComponent,
        PolarGridComponent,
        PolarAngleAxisComponent,
        PolarRadiusAxisComponent,
      ],
      providers: [TooltipService, ResponsiveContainerService],
    }),
  ],
  parameters: {
    layout: 'centered',
  },
  argTypes: {
    width: { control: { type: 'number', min: 200, max: 800 } },
    height: { control: { type: 'number', min: 200, max: 800 } },
  },
};

export default meta;
type Story = StoryObj<RadarChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: { ...args, radarData },
    template: `
      <ngx-radar-chart [data]="radarData" [width]="width" [height]="height"
        cx="50%" cy="50%" [outerRadius]="'80%'">
        <svg:g ngx-polar-grid></svg:g>
        <svg:g ngx-polar-angle-axis dataKey="subject"></svg:g>
        <svg:g ngx-polar-radius-axis></svg:g>
        <svg:g ngx-radar dataKey="A" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
      </ngx-radar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 500,
  },
};

export const TwoRadars: Story = {
  name: 'Two Radars (Comparison)',
  render: (args) => ({
    props: { ...args, radarData },
    template: `
      <ngx-radar-chart [data]="radarData" [width]="width" [height]="height"
        cx="50%" cy="50%" [outerRadius]="'80%'">
        <svg:g ngx-polar-grid></svg:g>
        <svg:g ngx-polar-angle-axis dataKey="subject"></svg:g>
        <svg:g ngx-polar-radius-axis></svg:g>
        <svg:g ngx-radar dataKey="A" stroke="#8884d8" fill="#8884d8" [fillOpacity]="0.6"></svg:g>
        <svg:g ngx-radar dataKey="B" stroke="#82ca9d" fill="#82ca9d" [fillOpacity]="0.6"></svg:g>
      </ngx-radar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 500,
  },
};

export const CircleShape: Story = {
  render: (args) => ({
    props: { ...args, radarData },
    template: `
      <ngx-radar-chart [data]="radarData" [width]="width" [height]="height"
        cx="50%" cy="50%" [outerRadius]="'80%'">
        <svg:g ngx-polar-grid></svg:g>
        <svg:g ngx-polar-angle-axis dataKey="subject"></svg:g>
        <svg:g ngx-polar-radius-axis></svg:g>
        <svg:g ngx-radar dataKey="A" stroke="#ff7300" fill="#ff7300" [fillOpacity]="0.5"
          [dot]="true" shape="circle"></svg:g>
      </ngx-radar-chart>
    `,
  }),
  args: {
    width: 500,
    height: 500,
  },
};
