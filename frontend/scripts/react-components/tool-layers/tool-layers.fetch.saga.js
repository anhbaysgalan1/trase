import { put, call, cancelled, select } from 'redux-saga/effects';
import {
  getURLFromParams,
  GET_LINKED_GEO_IDS_URL,
  GET_MAP_BASE_DATA_URL
} from 'utils/getURLFromParams';
import { fetchWithCancel } from 'utils/saga-utils';
import { getSelectedColumnsIds } from 'react-components/tool/tool.selectors';
import { getSelectedNodesColumnsPos } from 'react-components/tool-links/tool-links.selectors';
import {
  setMapDimensions,
  setLinkedGeoIds
} from 'react-components/tool-layers/tool-layers.actions';
import intesection from 'lodash/intersection';
import { YEARS_DISABLED_UNAVAILABLE, YEARS_INCOMPLETE } from 'constants';
import { getSingleMapDimensionWarning } from 'reducers/helpers/getMapDimensionsWarnings';
import { setMapContextLayers } from 'react-components/tool/tool.actions';
import { getSelectedContext, getSelectedYears } from 'reducers/app.selectors';

export function* getLinkedGeoIds() {
  const {
    toolLinks: { selectedNodesIds }
  } = yield select();
  const selectedColumnsIds = yield select(getSelectedColumnsIds);
  const selectedNodesColumnsPos = yield select(getSelectedNodesColumnsPos);
  const selectedYears = yield select(getSelectedYears);
  const selectedContext = yield select(getSelectedContext);

  const selectedNonGeoNodeIds = selectedNodesIds.filter(
    (nodeId, index) => selectedNodesColumnsPos[index] !== 0
  );
  // when selection only contains geo nodes (column 0), we should not call get_linked_geoids
  if (selectedNonGeoNodeIds.length === 0) {
    yield put(setLinkedGeoIds([]));
    return;
  }
  const params = {
    context_id: selectedContext.id,
    years: Array.from(new Set([selectedYears[0], selectedYears[1]])),
    nodes_ids: selectedNodesIds,
    target_column_id: selectedColumnsIds[0]
  };
  const url = getURLFromParams(GET_LINKED_GEO_IDS_URL, params);
  const { source, fetchPromise } = fetchWithCancel(url);

  try {
    const { data } = yield call(fetchPromise);
    yield put(setLinkedGeoIds(data.nodes));
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled');
      if (source) {
        source.cancel();
      }
    }
  }
}

export function* getMapDimensions(selectedContext, selectedYears) {
  const params = {
    context_id: selectedContext.id,
    start_year: selectedYears[0],
    end_year: selectedYears[1]
  };

  const url = getURLFromParams(GET_MAP_BASE_DATA_URL, params);
  const { source, fetchPromise } = fetchWithCancel(url);

  try {
    const { data } = yield call(fetchPromise);
    const [startYear, endYear] = selectedYears;
    const allSelectedYears = Array(endYear - startYear + 1)
      .fill(startYear)
      .map((year, index) => year + index);

    data.dimensions.forEach(dimension => {
      const allYearsCovered =
        dimension.years === null ||
        dimension.years.length === 0 ||
        allSelectedYears.every(year => dimension.years.includes(year));
      const yearsWithDataToDisplay = intesection(dimension.years, allSelectedYears);
      if (!allYearsCovered && allSelectedYears.length > 1 && yearsWithDataToDisplay.length > 0) {
        dimension.disabledYearRangeReason = YEARS_INCOMPLETE;
        dimension.disabledYearRangeReasonText = getSingleMapDimensionWarning(
          dimension.disabledYearRangeReason,
          yearsWithDataToDisplay,
          dimension.years
        );
      } else if (!allYearsCovered) {
        dimension.disabledYearRangeReason = YEARS_DISABLED_UNAVAILABLE;
        dimension.disabledYearRangeReasonText = getSingleMapDimensionWarning(
          dimension.disabledYearRangeReason,
          yearsWithDataToDisplay,
          dimension.years
        );
      }
    });

    yield put(setMapContextLayers(data.contextualLayers));
    yield put(setMapDimensions(data.dimensions, data.dimensionGroups));
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled');
      if (source) {
        source.cancel();
      }
    }
  }
}