import {
  take,
  select,
  all,
  fork,
  call,
  put,
  takeLatest,
  cancel,
  takeEvery,
  takeLeading
} from 'redux-saga/effects';
import {
  setDashboardLoading,
  DASHBOARD_ELEMENT__CLEAR_PANEL,
  DASHBOARD_ELEMENT__SET_ACTIVE_PANEL,
  DASHBOARD_ELEMENT__SET_ACTIVE_TAB,
  DASHBOARD_ELEMENT__SET_ACTIVE_ITEM,
  DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS,
  DASHBOARD_ELEMENT__SET_PANEL_PAGE,
  DASHBOARD_ELEMENT__GET_SEARCH_RESULTS,
  DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS_WITH_SEARCH,
  DASHBOARD_ELEMENT__CLEAR_PANELS,
  DASHBOARD_ELEMENT__SET_SELECTED_YEARS,
  DASHBOARD_ELEMENT__SET_SELECTED_RESIZE_BY,
  DASHBOARD_ELEMENT__SET_SELECTED_RECOLOR_BY,
  DASHBOARD_ELEMENT__GET_MISSING_DATA,
  DASHBOARD_ELEMENT__SET_MISSING_DATA,
  DASHBOARD_ELEMENT__SET_PANEL_TABS
} from 'react-components/dashboard-element/dashboard-element.actions';
import {
  getMissingDashboardPanelItems,
  getDashboardPanelSectionTabs,
  getDashboardPanelData,
  getMoreDashboardPanelData,
  fetchDashboardPanelSearchResults,
  fetchDashboardCharts
} from 'react-components/dashboard-element/dashboard-element.fetch.saga';
import {
  getSourcesActiveTab,
  getCompaniesActiveTab,
  getDashboardPanelsValues
} from 'react-components/dashboard-element/dashboard-element.selectors';
import { DASHBOARD_STEPS } from 'constants';

const hasActiveItems = (_state, panelId) => {
  const panel = _state[`${panelId}Panel`];
  return panel.activeItems.length > 0;
};

export function* fetchMissingDashboardPanelItems() {
  function* fetchMissingItems() {
    const panelsValues = yield select(getDashboardPanelsValues);
    const dashboardElement = yield select(state => state.dashboardElement);
    const tasks = [];
    if (panelsValues.countries === null && dashboardElement.countriesPanel.activeItems.length > 0) {
      tasks.push(
        call(getMissingDashboardPanelItems, dashboardElement, 'countries', null, {
          isOverview: true
        })
      );
    }

    if (panelsValues.sources === null && dashboardElement.sourcesPanel.activeItems.length > 0) {
      tasks.push(
        call(
          getMissingDashboardPanelItems,
          dashboardElement,
          'sources',
          dashboardElement.sourcesPanel.activeTab,
          {
            isOverview: true
          }
        )
      );
    }

    if (
      panelsValues.commodities === null &&
      dashboardElement.commoditiesPanel.activeItems.length > 0
    ) {
      tasks.push(
        call(getMissingDashboardPanelItems, dashboardElement, 'commodities', null, {
          isOverview: true
        })
      );
    }

    if (
      panelsValues.destinations === null &&
      dashboardElement.destinationsPanel.activeItems.length > 0
    ) {
      tasks.push(
        call(getMissingDashboardPanelItems, dashboardElement, 'destinations', null, {
          isOverview: true
        })
      );
    }

    if (panelsValues.companies === null && dashboardElement.companiesPanel.activeItems.length > 0) {
      tasks.push(
        call(
          getMissingDashboardPanelItems,
          dashboardElement,
          'companies',
          dashboardElement.companiesPanel.activeTab,
          {
            isOverview: true
          }
        )
      );
    }

    yield all(tasks);
    yield put(setDashboardLoading(false));
  }

  yield takeLeading(DASHBOARD_ELEMENT__GET_MISSING_DATA, fetchMissingItems);
}

export function* onMissingItemDownload(action) {
  const { key } = action.payload;
  if (key === 'countries') {
    yield fork(getDashboardPanelSectionTabs, 'sources');
  }

  if (key === 'companies') {
    yield fork(getDashboardPanelSectionTabs, 'companies');
  }
}

function* fetchDataMissingItemDownload() {
  yield takeEvery([DASHBOARD_ELEMENT__SET_MISSING_DATA], onMissingItemDownload);
}

/**
 * Should receive the DASHBOARD_ELEMENT__SET_ACTIVE_PANEL action and depending on which panel it is on fetch the necessary data.
 * - Sources panel => Load countries data
 *                 => If a country is selected, load the next level's data
 *
 * - Companies panel => Load the companies available tabs
 * - Commodities/Destinations panel => Load data
 */
export function* fetchDashboardPanelInitialData(action) {
  const { activePanelId } = action.payload;
  const state = yield select();
  const { dashboardElement } = state;

  function* fetchTabPanelData(selector) {
    const tab = yield select(selector);

    if (hasActiveItems(dashboardElement, activePanelId)) {
      yield fork(getMoreDashboardPanelData, dashboardElement, activePanelId, tab);
    } else {
      yield fork(getDashboardPanelData, dashboardElement, activePanelId, tab);
    }
  }

  if (dashboardElement.activePanelId === 'companies') {
    yield fork(getDashboardPanelSectionTabs, activePanelId);
    yield fork(fetchTabPanelData, getCompaniesActiveTab);
  } else if (activePanelId === 'sources') {
    const countriesSaga = hasActiveItems(dashboardElement, 'countries')
      ? getMoreDashboardPanelData
      : getDashboardPanelData;
    yield fork(countriesSaga, dashboardElement, 'countries');
    // Fetch regions
    if (dashboardElement.countriesPanel.activeItems.length > 0) {
      yield fork(fetchTabPanelData, getSourcesActiveTab);
    }
  } else {
    yield fork(getDashboardPanelData, dashboardElement, activePanelId);
  }
}

/**
 * Checks if the activeItem in one of the panels has changed, if it has changed it fetches the panel data.
 */
export function* fetchDataOnPanelChange() {
  const panelsOrder = ['sources', 'commodities', 'destinations', 'companies'];
  let loaded = [];
  let previousPanelState = null;
  let task = null;
  const hasChangedAt = panel => {
    if (!previousPanelState) return -1;
    return [
      panel.countriesPanel.activeItems !== previousPanelState.countriesPanel.activeItems ||
        panel.sourcesPanel.activeItems !== previousPanelState.sourcesPanel.activeItems,
      panel.commoditiesPanel.activeItems !== previousPanelState.commoditiesPanel.activeItems,
      panel.destinationsPanel.activeItems !== previousPanelState.destinationsPanel.activeItems,
      panel.companiesPanel.activeItems !== previousPanelState.companiesPanel.activeItems
    ].findIndex(value => value === true);
  };

  while (true) {
    const activePanel = yield take(DASHBOARD_ELEMENT__SET_ACTIVE_PANEL);
    const { activePanelId } = activePanel.payload;

    const newPanelState = yield select(state => state.dashboardElement);
    const changedAt = hasChangedAt(newPanelState);
    if (changedAt !== -1) {
      loaded = panelsOrder.slice(0, changedAt + 1);
    }

    const newPanelData = newPanelState.data[activePanelId];
    const isEmpty = Array.isArray(newPanelState)
      ? newPanelData.length === 0
      : Object.keys(newPanelData).length === 0;

    if (!previousPanelState || !loaded.includes(activePanelId) || isEmpty) {
      if (task !== null) {
        yield cancel(task);
      }
      task = yield fork(fetchDashboardPanelInitialData, activePanel);
      if (!loaded.includes(activePanelId)) {
        loaded.push(activePanelId);
      }
    }
    previousPanelState = newPanelState;
  }
}

/**
 * Reads the query from the DASHBOARD_ELEMENT__GET_SEARCH_RESULTS action
 * and calls fetchDashboardPanelSearchResults to fetch the data.
 */
export function* getSearchResults(action) {
  const state = yield select();
  const { query } = action.payload;
  const { dashboardElement } = state;
  yield fork(fetchDashboardPanelSearchResults, dashboardElement, query);
}

function* fetchDataOnSearch() {
  yield takeLatest(DASHBOARD_ELEMENT__GET_SEARCH_RESULTS, getSearchResults);
}

export function* fetchDataOnTabsFetch() {
  function* onTabsFetch(action) {
    const { key } = action.payload;
    const { dashboardElement } = yield select();
    let activeTabSelector;
    if (key === 'sources') {
      activeTabSelector = getSourcesActiveTab;
    }
    if (key === 'companies') {
      activeTabSelector = getCompaniesActiveTab;
    }

    const activeTab = yield select(activeTabSelector);
    if (
      !dashboardElement.data[key][activeTab] ||
      dashboardElement.data[key][activeTab].length === 0
    ) {
      yield fork(getDashboardPanelData, dashboardElement, key, activeTab);
    }
  }

  yield takeLatest([DASHBOARD_ELEMENT__SET_PANEL_TABS], onTabsFetch);
}
/**
 * Fetches the data for the activeTab if the data hasn't been loaded.
 */
export function* onTabChange(action) {
  const { panel } = action.payload;
  const { dashboardElement } = yield select();
  const activePanelId = panel || dashboardElement.activePanelId;
  let activeTabSelector = null;
  if (activePanelId === 'sources') {
    activeTabSelector = getSourcesActiveTab;
  }
  if (activePanelId === 'companies') {
    activeTabSelector = getCompaniesActiveTab;
  }
  const activeTab = activeTabSelector && (yield select(activeTabSelector));

  if (activePanelId && activeTab) {
    if (
      dashboardElement.data[panel][activeTab] &&
      dashboardElement.data[panel][activeTab].length > 0
    ) {
      yield fork(getMoreDashboardPanelData, dashboardElement, activePanelId, activeTab);
    } else {
      yield fork(getDashboardPanelData, dashboardElement, activePanelId, activeTab);
    }
  }
}

function* fetchDataOnTabChange() {
  yield takeLatest(
    [DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS_WITH_SEARCH, DASHBOARD_ELEMENT__SET_ACTIVE_TAB],
    onTabChange
  );
}

/**
 * Listens to DASHBOARD_ELEMENT__SET_ACTIVE_ITEM and requests the tabs data every time a new country has been selected.
 */
export function* onItemChange(action) {
  const { panel, activeItem } = action.payload;
  // for now, we just need to recalculate the tabs when selecting a new country
  if (panel === 'countries' && activeItem) {
    yield fork(getDashboardPanelSectionTabs, 'sources');
  }
}

function* fetchDataOnItemChange() {
  yield takeLatest(
    [DASHBOARD_ELEMENT__SET_ACTIVE_ITEM, DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS],
    onItemChange
  );
}

/**
 * Listens to actions that remove or clear panel items and deletes all subsequent selections if the panel is changed
 */

export function* onChangePanel(action) {
  const { panel } = action.payload;
  const dashboardElement = yield select(state => state.dashboardElement);
  const dashboardStepName = panel === 'countries' ? 'sources' : panel;
  const panelIndex = DASHBOARD_STEPS[dashboardStepName];
  const nextPanels = Object.keys(DASHBOARD_STEPS).slice(panelIndex + 1);

  const panelsToClear = nextPanels
    .map(p => ({ name: p, items: dashboardElement[`${p}Panel`].activeItems }))
    .filter(p => p.items.length > 0)
    .map(p => p.name);

  if (panelsToClear.length > 0) {
    yield put({
      type: DASHBOARD_ELEMENT__CLEAR_PANELS,
      payload: { panels: nextPanels }
    });
  }
}

function* clearSubsequentPanels() {
  yield takeLatest(
    [
      DASHBOARD_ELEMENT__CLEAR_PANEL,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEM,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS_WITH_SEARCH
    ],
    onChangePanel
  );
}

/**
 * Listens to DASHBOARD_ELEMENT__SET_PANEL_PAGE and fetches the data for the next page.
 */
export function* onPageChange() {
  const { dashboardElement } = yield select();
  let activeTabSelector = null;
  if (dashboardElement.activePanelId === 'sources') {
    activeTabSelector = getSourcesActiveTab;
  }
  if (dashboardElement.activePanelId === 'companies') {
    activeTabSelector = getCompaniesActiveTab;
  }
  const activeTab = activeTabSelector && (yield select(activeTabSelector));
  yield fork(
    getMoreDashboardPanelData,
    dashboardElement,
    dashboardElement.activePanelId,
    activeTab
  );
}

function* fetchDataOnPageChange() {
  yield takeLatest(DASHBOARD_ELEMENT__SET_PANEL_PAGE, onPageChange);
}

function* fetchChartsOnIndicatorsChange() {
  yield takeLatest(
    [
      DASHBOARD_ELEMENT__SET_SELECTED_YEARS,
      DASHBOARD_ELEMENT__SET_SELECTED_RESIZE_BY,
      DASHBOARD_ELEMENT__SET_SELECTED_RECOLOR_BY
    ],
    fetchDashboardCharts
  );
}

function* updateIndicatorsOnItemChange() {
  const { dashboardElement } = yield select();

  const contextSelected =
    dashboardElement.countriesPanel.activeItems.length > 0 &&
    dashboardElement.commoditiesPanel.activeItems.length > 0;
  if (contextSelected) {
    yield fork(fetchDashboardCharts);
  }
}

function* fetchChartsOnItemChange() {
  yield takeLatest(
    [
      DASHBOARD_ELEMENT__CLEAR_PANEL,
      DASHBOARD_ELEMENT__CLEAR_PANELS,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEM,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS,
      DASHBOARD_ELEMENT__SET_MISSING_DATA,
      DASHBOARD_ELEMENT__SET_ACTIVE_ITEMS_WITH_SEARCH
    ],
    updateIndicatorsOnItemChange
  );
}

export default function* dashboardElementSaga() {
  const sagas = [
    fetchDataOnPanelChange,
    fetchDataOnTabsFetch,
    fetchDataOnTabChange,
    fetchDataOnItemChange,
    clearSubsequentPanels,
    fetchDataOnPageChange,
    fetchDataOnSearch,
    fetchChartsOnIndicatorsChange,
    fetchChartsOnItemChange,
    fetchMissingDashboardPanelItems,
    fetchDataMissingItemDownload
  ];
  yield all(sagas.map(saga => fork(saga)));
}
