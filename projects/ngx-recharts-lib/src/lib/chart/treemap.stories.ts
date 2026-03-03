import type { Meta, StoryObj } from '@storybook/angular';
import { moduleMetadata } from '@storybook/angular';
import { TreemapComponent } from './treemap.component';
import { ResponsiveContainerService } from '../services/responsive-container.service';

const treemapData = [
  { name: 'Axis', size: 24593 },
  { name: 'Axes', size: 1302 },
  { name: 'Anchor', size: 2138 },
  { name: 'Control', size: 1353 },
  { name: 'Data', size: 20544 },
  { name: 'NodeSprite', size: 19382 },
];

const meta: Meta<TreemapComponent> = {
  title: 'Charts/Treemap',
  component: TreemapComponent,
  decorators: [
    moduleMetadata({
      providers: [ResponsiveContainerService],
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
type Story = StoryObj<TreemapComponent>;

export const Default: Story = {
  render: (args) => ({
    props: args,
    template: `
      <ngx-treemap [data]="data" dataKey="size" nameKey="name" [width]="width" [height]="height"></ngx-treemap>
    `,
  }),
  args: {
    data: treemapData,
    width: 600,
    height: 400,
  },
};
