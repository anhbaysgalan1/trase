import deburr from 'lodash/deburr';
import pickBy from 'lodash/pickBy';
import { put, call, cancelled, select, fork } from 'redux-saga/effects';
import {
  DASHBOARD_ELEMENT__SET_PANEL_TABS,
  DASHBOARD_ELEMENT__SET_PANEL_DATA,
  setDashboardLoading,
  getDashboardPanelParams,
  setMoreDashboardPanelData,
  setMissingDashboardPanelItems,
  setDashboardPanelLoadingItems,
  DASHBOARD_ELEMENT__SET_SEARCH_RESULTS,
  DASHBOARD_ELEMENT__SET_CHARTS
} from 'react-components/dashboard-element/dashboard-element.actions';
import {
  getDashboardSelectedYears,
  getDashboardSelectedResizeBy,
  getDashboardSelectedRecolorBy
} from 'react-components/dashboard-element/dashboard-element.selectors';
import {
  getURLFromParams,
  GET_DASHBOARD_OPTIONS_URL,
  GET_DASHBOARD_OPTIONS_TABS_URL,
  GET_DASHBOARD_SEARCH_RESULTS_URL,
  GET_DASHBOARD_PARAMETRISED_CHARTS_URL
} from 'utils/getURLFromParams';
import { fetchWithCancel, setLoadingSpinner } from 'utils/saga-utils';

export function* getDashboardPanelData(dashboardElement, optionsType, options) {
  const panelId = dashboardElement.activePanelId;
  const { page, activeTab } = dashboardElement[`${panelId}Panel`];
  const tab = activeTab;
  const params = getDashboardPanelParams(dashboardElement, optionsType, {
    page,
    ...options
  });
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_URL, params);
  const task = yield fork(setLoadingSpinner, 750, setDashboardPanelLoadingItems(true, panelId));
  yield put({
    type: DASHBOARD_ELEMENT__SET_PANEL_DATA,
    payload: {
      key: optionsType,
      tab,
      data: null,
      meta: null
    }
  });
  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    if (task.isRunning()) {
      task.cancel();
    }
    yield put({
      type: DASHBOARD_ELEMENT__SET_PANEL_DATA,
      payload: {
        key: optionsType,
        tab,
        data: data.data,
        meta: data.meta
      }
    });
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', tab);
      if (source) {
        source.cancel();
      }
    }
    yield fork(setLoadingSpinner, 750, setDashboardPanelLoadingItems(false, panelId));
  }
}

export function* getDashboardPanelSectionTabs(dashboardElement, optionsType) {
  const params = getDashboardPanelParams(dashboardElement, optionsType);
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_TABS_URL, params);
  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    yield put({
      type: DASHBOARD_ELEMENT__SET_PANEL_TABS,
      payload: {
        data: data.data,
        key: optionsType
      }
    });
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', url);
      if (source) {
        source.cancel();
      }
    }
  }
}

export function* getMoreDashboardPanelData(dashboardElement, optionsType, activeTab) {
  const { page } = dashboardElement[`${dashboardElement.activePanelId}Panel`];
  const params = getDashboardPanelParams(dashboardElement, optionsType, { page });
  const task = yield fork(
    setLoadingSpinner,
    350,
    setDashboardPanelLoadingItems(true, dashboardElement.activePanelId)
  );
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_URL, params);
  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    yield put(
      setMoreDashboardPanelData({
        data: data.data,
        key: optionsType,
        tab: activeTab
      })
    );
    if (task.isRunning()) {
      task.cancel();
    }
  } catch (e) {
    console.error('Error', e);
    if (task.isRunning()) {
      task.cancel();
    }
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', url);
      if (source) {
        source.cancel();
      }
    }
    yield call(
      setLoadingSpinner,
      750,
      setDashboardPanelLoadingItems(false, dashboardElement.activePanelId)
    );
  }
}

export function* getMissingDashboardPanelItems(dashboardElement, optionsType, activeTab, options) {
  const params = getDashboardPanelParams(dashboardElement, optionsType, options);
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_URL, params);
  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    yield put(setMissingDashboardPanelItems(optionsType, data.data, activeTab));
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', url);
      if (source) {
        source.cancel();
      }
    }
  }
}

export function* fetchDashboardPanelSearchResults(dashboardElement, query) {
  if (!query) return;
  let optionsType = dashboardElement.activePanelId;
  if (optionsType === 'sources' && dashboardElement.countriesPanel.activeItems.length === 0) {
    optionsType = 'countries';
  }
  // eslint-ignore-next-line
  const { node_types_ids: excluded, ...filters } = getDashboardPanelParams(
    dashboardElement,
    optionsType
  );
  const params = {
    ...filters,
    q: deburr(query)
  };
  const url = getURLFromParams(GET_DASHBOARD_SEARCH_RESULTS_URL, params);

  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    yield put({
      type: DASHBOARD_ELEMENT__SET_SEARCH_RESULTS,
      payload: {
        query,
        data: data.data
      }
    });
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', url);
      if (source) {
        source.cancel();
      }
    }
  }
}

export function* fetchDashboardCharts() {
  const selectedResizeBy = yield select(getDashboardSelectedResizeBy);
  const selectedRecolorBy = yield select(getDashboardSelectedRecolorBy);
  const selectedYears = yield select(getDashboardSelectedYears);
  const dashboardElement = yield select(state => state.dashboardElement);
  const {
    countries_ids: countryId,
    commodities_ids: commodityId,
    ...options
  } = getDashboardPanelParams(dashboardElement, null, { isOverview: true });
  const params = pickBy(
    {
      ...options,
      country_id: countryId,
      commodity_id: commodityId,
      cont_attribute_id: selectedResizeBy?.attributeId,
      ncont_attribute_id: selectedRecolorBy?.attributeId,
      start_year: selectedYears[0],
      end_year: selectedYears[1]
    },
    x => !!x
  );

  if (!params.commodity_id || !params.country_id || !params.start_year || !params.end_year) {
    return;
  }
  const url = getURLFromParams(GET_DASHBOARD_PARAMETRISED_CHARTS_URL, params);

  yield put(setDashboardLoading(true));
  const { source, fetchPromise } = fetchWithCancel(url);
  try {
    const { data } = yield call(fetchPromise);
    yield put({
      type: DASHBOARD_ELEMENT__SET_CHARTS,
      payload: { charts: data }
    });
  } catch (e) {
    console.error('Error', e);
  } finally {
    if (yield cancelled()) {
      if (NODE_ENV_DEV) console.error('Cancelled', params);
      if (source) {
        source.cancel();
      }
    }
    yield call(setLoadingSpinner, 750, setDashboardLoading(false));
  }
}
