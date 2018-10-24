/* eslint-disable camelcase */
import {
  getURLFromParams,
  GET_DASHBOARD_OPTIONS_URL,
  GET_DASHBOARD_OPTIONS_TABS_URL,
  GET_DASHBOARD_SEARCH_RESULTS_URL
} from 'utils/getURLFromParams';

export const DASHBOARD_ELEMENT__SET_MORE_PANEL_DATA = 'DASHBOARD_ELEMENT__SET_MORE_PANEL_DATA';
export const DASHBOARD_ELEMENT__SET_PANEL_DATA = 'DASHBOARD_ELEMENT__SET_PANEL_DATA';
export const DASHBOARD_ELEMENT__SET_ACTIVE_PANEL = 'DASHBOARD_ELEMENT__SET_ACTIVE_PANEL';
export const DASHBOARD_ELEMENT__SET_ACTIVE_ID = 'DASHBOARD_ELEMENT__SET_ACTIVE_ID';
export const DASHBOARD_ELEMENT__CLEAR_PANEL = 'DASHBOARD_ELEMENT__CLEAR_PANEL';
export const DASHBOARD_ELEMENT__ADD_ACTIVE_INDICATOR = 'DASHBOARD_ELEMENT__ADD_ACTIVE_INDICATOR';
export const DASHBOARD_ELEMENT__REMOVE_ACTIVE_INDICATOR =
  'DASHBOARD_ELEMENT__REMOVE_ACTIVE_INDICATOR';
export const DASHBOARD_ELEMENT__SET_PANEL_TABS = 'DASHBOARD_ELEMENT__SET_PANEL_TABS';
export const DASHBOARD_ELEMENT__SET_PANEL_PAGE = 'DASHBOARD_ELEMENT__SET_PANEL_PAGE';
export const DASHBOARD_ELEMENT__SET_LOADING_ITEMS = 'DASHBOARD_ELEMENT__SET_LOADING_ITEMS';
export const DASHBOARD_ELEMENT__SET_SEARCH_RESULTS = 'DASHBOARD_ELEMENT__SET_SEARCH_RESULTS';

const getDashboardPanelParams = (state, options_type, options = {}) => {
  const { sourcesPanel, companiesPanel, destinationsPanel, commoditiesPanel } = state;
  const { page, refetchPanel } = options;
  const node_types_ids = {
    sources: sourcesPanel.activeSourceTabId,
    companies: companiesPanel.activeNodeTypeTabId
  }[options_type];
  const params = {
    page,
    options_type,
    node_types_ids,
    countries_ids: sourcesPanel.activeCountryItemId
  };

  if (options_type !== 'sources' || refetchPanel) {
    params.sources_ids = sourcesPanel.activeSourceItemId;
  }

  if (options_type !== 'commodities' || refetchPanel) {
    params.commodities_ids = commoditiesPanel.activeCommodityItemId;
  }

  if (options_type !== 'destinations' || refetchPanel) {
    params.destinations_ids = destinationsPanel.activeDestinationItemId;
  }

  if (options_type !== 'companies' || refetchPanel) {
    params.companies_ids = companiesPanel.activeCompanyItemId;
  }
  return params;
};

export const getDashboardPanelData = (optionsType, tab, options) => (dispatch, getState) => {
  const { dashboardElement } = getState();
  const { page } = dashboardElement[`${dashboardElement.activePanelId}Panel`];
  const params = getDashboardPanelParams(dashboardElement, optionsType, { page, ...options });
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_URL, params);
  const key = optionsType !== 'attributes' ? optionsType : 'indicators'; // FIXME

  dispatch({
    type: DASHBOARD_ELEMENT__SET_PANEL_DATA,
    payload: { key, tab, data: null, meta: null }
  });

  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
    .then(json =>
      dispatch({
        type: DASHBOARD_ELEMENT__SET_PANEL_DATA,
        payload: {
          key,
          tab,
          data: json.data,
          meta: json.meta
        }
      })
    );
};

export const getDashboardPanelSectionTabs = options_type => (dispatch, getState) => {
  const params = getDashboardPanelParams(getState().dashboardElement, options_type);
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_TABS_URL, params);

  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
    .then(json =>
      dispatch({
        type: DASHBOARD_ELEMENT__SET_PANEL_TABS,
        payload: {
          data: json.data
        }
      })
    );
};

export const setDashboardActivePanel = activePanelId => ({
  type: DASHBOARD_ELEMENT__SET_ACTIVE_PANEL,
  payload: { activePanelId }
});

export const setDashboardPanelActiveId = ({ type, active, panel, section }) => ({
  type: DASHBOARD_ELEMENT__SET_ACTIVE_ID,
  payload: {
    type,
    panel,
    active,
    section
  }
});

export const clearDashboardPanel = panel => ({
  type: DASHBOARD_ELEMENT__CLEAR_PANEL,
  payload: { panel }
});

export const addActiveIndicator = active => ({
  type: DASHBOARD_ELEMENT__ADD_ACTIVE_INDICATOR,
  payload: { active }
});

export const removeActiveIndicator = toRemove => ({
  type: DASHBOARD_ELEMENT__REMOVE_ACTIVE_INDICATOR,
  payload: { toRemove }
});

export const setDashboardPanelPage = (page, direction) => ({
  type: DASHBOARD_ELEMENT__SET_PANEL_PAGE,
  payload: { page, direction }
});

export const setDashboardPanelLoadingItems = loadingItems => ({
  type: DASHBOARD_ELEMENT__SET_LOADING_ITEMS,
  payload: { loadingItems }
});

export const getMoreDashboardPanelData = (optionsType, tab, direction) => (dispatch, getState) => {
  const { dashboardElement } = getState();
  const { page } = dashboardElement[`${dashboardElement.activePanelId}Panel`];
  const params = getDashboardPanelParams(dashboardElement, optionsType, { page });
  const url = getURLFromParams(GET_DASHBOARD_OPTIONS_URL, params);
  const key = optionsType !== 'attributes' ? optionsType : 'indicators'; // FIXME

  const timeoutId = setTimeout(() => dispatch(setDashboardPanelLoadingItems(true)), 300);

  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
    .then(json => {
      clearTimeout(timeoutId);
      setTimeout(() => dispatch(setDashboardPanelLoadingItems(false)), 1000);
      dispatch({
        type: DASHBOARD_ELEMENT__SET_MORE_PANEL_DATA,
        payload: {
          key,
          tab,
          direction,
          data: json.data
        }
      });
    })
    .catch(err => {
      console.error(err);
      dispatch(setDashboardPanelLoadingItems(false));
    });
};

export const getDashboardPanelSearchResults = query => (dispatch, getState) => {
  if (!query) return;
  const { dashboardElement } = getState();
  let optionsType = dashboardElement.activePanelId;
  if (
    optionsType === 'sources' &&
    dashboardElement.sourcesPanel.activeCountryItemId === null &&
    dashboardElement.sourcesPanel.activeSourceTabId === null
  ) {
    optionsType = 'countries';
  }
  const filters = getDashboardPanelParams(dashboardElement, optionsType);
  const params = { ...filters, q: query };
  const url = getURLFromParams(GET_DASHBOARD_SEARCH_RESULTS_URL, params);

  fetch(url)
    .then(res => (res.ok ? res.json() : Promise.reject(res.statusText)))
    .then(json =>
      dispatch({
        type: DASHBOARD_ELEMENT__SET_SEARCH_RESULTS,
        payload: {
          data: json.data
        }
      })
    )
    .catch(err => console.error(err));
};