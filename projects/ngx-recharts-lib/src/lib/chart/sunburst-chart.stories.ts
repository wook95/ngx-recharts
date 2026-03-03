import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { SunburstChartComponent } from './sunburst-chart.component';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const sunburstData = {
  name: 'root',
  children: [
    {
      name: 'A',
      value: 10,
      children: [
        { name: 'A1', value: 4 },
        { name: 'A2', value: 6 },
      ],
    },
    {
      name: 'B',
      value: 15,
      children: [
        { name: 'B1', value: 8 },
        { name: 'B2', value: 7 },
      ],
    },
    { name: 'C', value: 5 },
  ],
};

const meta: Meta<SunburstChartComponent> = {
  title: 'Charts/SunburstChart',
  component: SunburstChartComponent,
  decorators: [
    moduleMetadata({
      providers: [ResponsiveContainerService],
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
type Story = StoryObj<SunburstChartComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-sunburst-chart [data]="data" [width]="width" [height]="height"></ngx-sunburst-chart>
    `,
  }),
  args: {
    data: sunburstData,
    width: 400,
    height: 400,
  },
};
