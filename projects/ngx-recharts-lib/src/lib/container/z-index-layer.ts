export enum ZIndexLayer {
  GRID = 'grid',
  REFERENCE = 'reference',
  GRAPHICAL_ITEMS = 'graphical-items',
  AXIS = 'axis',
  LABEL = 'label',
  TOOLTIP = 'tooltip',
  LEGEND = 'legend',
}

export const DefaultZIndexes: Record<ZIndexLayer, number> = {
  [ZIndexLayer.GRID]: 0,
  [ZIndexLayer.REFERENCE]: 100,
  [ZIndexLayer.GRAPHICAL_ITEMS]: 200,
  [ZIndexLayer.AXIS]: 300,
  [ZIndexLayer.LABEL]: 400,
  [ZIndexLayer.TOOLTIP]: 500,
  [ZIndexLayer.LEGEND]: 600,
};
