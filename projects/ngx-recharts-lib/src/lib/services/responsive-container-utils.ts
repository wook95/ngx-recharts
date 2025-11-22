export interface ChartDimensions {
  calculatedWidth: number | undefined;
  calculatedHeight: number | undefined;
}

export interface DimensionProps {
  width?: string | number;
  height?: string | number;
  aspect?: number;
  maxHeight?: number;
}

function isPercent(value: string | number | undefined): boolean {
  return typeof value === 'string' && value.includes('%');
}

export function calculateChartDimensions(
  containerWidth: number | undefined,
  containerHeight: number | undefined,
  props: DimensionProps,
): ChartDimensions {
  const { width = '100%', height = '100%', aspect, maxHeight } = props;

  // Container dimensions are already percentage-based from CSS
  let calculatedWidth: number | undefined = isPercent(width) ? containerWidth : Number(width);
  let calculatedHeight: number | undefined = isPercent(height) ? containerHeight : Number(height);

  if (aspect && aspect > 0) {
    // Preserve aspect ratio
    if (calculatedWidth) {
      calculatedHeight = calculatedWidth / aspect;
    } else if (calculatedHeight) {
      calculatedWidth = calculatedHeight * aspect;
    }

    // Apply maxHeight constraint
    if (maxHeight && calculatedHeight != null && calculatedHeight > maxHeight) {
      calculatedHeight = maxHeight;
    }
  }

  return { calculatedWidth, calculatedHeight };
}

export function getDefaultWidthAndHeight(props: {
  width?: string | number;
  height?: string | number;
  aspect?: number;
}): { width: string | number; height: string | number } {
  const { width, height, aspect } = props;
  let calculatedWidth = width;
  let calculatedHeight = height;

  if (calculatedWidth === undefined && calculatedHeight === undefined) {
    calculatedWidth = '100%';
    calculatedHeight = '100%';
  } else if (calculatedWidth === undefined) {
    calculatedWidth = aspect && aspect > 0 ? undefined : '100%';
  } else if (calculatedHeight === undefined) {
    calculatedHeight = aspect && aspect > 0 ? undefined : '100%';
  }

  return { 
    width: calculatedWidth || '100%', 
    height: calculatedHeight || '100%' 
  };
}

export function getInnerDivStyle(props: { 
  width?: string | number; 
  height?: string | number; 
}): Record<string, any> {
  const { width, height } = props;
  const isWidthPercent = isPercent(width);
  const isHeightPercent = isPercent(height);

  if (isWidthPercent && isHeightPercent) {
    return { width: 0, height: 0, overflow: 'visible' };
  }
  if (isWidthPercent) {
    return { width: 0, overflowX: 'visible' };
  }
  if (isHeightPercent) {
    return { height: 0, overflowY: 'visible' };
  }
  return {};
}