import {
  stackOffsetExpand,
  stackOffsetNone,
  stackOffsetWiggle,
  stackOffsetSilhouette,
  stackOffsetDiverging,
} from 'd3-shape';
import { StackOffsetType } from '../services/chart-data.service';

export function getD3StackOffset(type: StackOffsetType) {
  switch (type) {
    case 'expand': return stackOffsetExpand;
    case 'wiggle': return stackOffsetWiggle;
    case 'silhouette': return stackOffsetSilhouette;
    case 'sign': return stackOffsetDiverging;
    case 'none':
    default:
      return stackOffsetNone;
  }
}
