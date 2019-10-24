import { connect } from 'react-redux';
import { createNodesPanelActions } from 'react-components/nodes-panel/nodes-panel.actions';
import { createNodesPanelSelectors } from 'react-components/nodes-panel/nodes-panel.selectors';
import SourcesPanel from './sources-panel.component';

const {
  setPage,
  fetchData,
  setLoadingItems,
  setSelectedItems,
  setSelectedTab,
  getSearchResults,
  setSearchResult
} = createNodesPanelActions('sources', {
  hasTabs: true,
  hasSearch: true,
  hasMultipleSelection: true
});

const sourcesProps = createNodesPanelSelectors('sources', {
  hasTabs: true,
  hasSearch: true,
  hasMultipleSelection: true
});

const mapDispatchToProps = {
  setPage,
  fetchData,
  setSelectedTab,
  setLoadingItems,
  setSearchResult,
  getSearchResults,
  setSelectedItems
};

export default connect(
  sourcesProps,
  mapDispatchToProps
)(SourcesPanel);
