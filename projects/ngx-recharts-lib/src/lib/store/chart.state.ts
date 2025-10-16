import { createFeature, createReducer, createSelector, on } from '@ngrx/store';
import { createAction, props } from '@ngrx/store';
import { ChartData, ChartOffset, PlotArea } from '../core/types';

export interface ChartState {
  data: ChartData[];
  offset: ChartOffset;
  plotArea: PlotArea | null;
  width: number;
  height: number;
  margin: {
    top: number;
    right: number;
    bottom: number;
    left: number;
  };
}

const initialState: ChartState = {
  data: [],
  offset: { top: 0, bottom: 0, left: 0, right: 0 },
  plotArea: null,
  width: 0,
  height: 0,
  margin: { top: 5, right: 5, bottom: 5, left: 5 }
};

// Actions
export const setChartData = createAction(
  '[Chart] Set Data',
  props<{ data: ChartData[] }>()
);

export const setChartDimensions = createAction(
  '[Chart] Set Dimensions',
  props<{ width: number; height: number }>()
);

export const setChartOffset = createAction(
  '[Chart] Set Offset',
  props<{ offset: ChartOffset }>()
);

// Reducer
const chartReducer = createReducer(
  initialState,
  on(setChartData, (state, { data }) => ({ ...state, data })),
  on(setChartDimensions, (state, { width, height }) => ({ ...state, width, height })),
  on(setChartOffset, (state, { offset }) => ({ ...state, offset }))
);

// Feature
export const chartFeature = createFeature({
  name: 'chart',
  reducer: chartReducer,
  extraSelectors: ({ selectChartState }) => ({
    selectPlotArea: createSelector(
      selectChartState,
      (state): PlotArea | null => {
        if (state.width === 0 || state.height === 0) return null;
        return {
          width: state.width - state.offset.left - state.offset.right,
          height: state.height - state.offset.top - state.offset.bottom,
          x: state.offset.left,
          y: state.offset.top
        };
      }
    )
  })
});

export const {
  selectChartState,
  selectData,
  selectOffset,
  selectWidth,
  selectHeight,
  selectMargin,
  selectPlotArea
} = chartFeature;