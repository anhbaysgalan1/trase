import {
  RESET_TOOL_STATE,
  SET_NODE_ATTRIBUTES,
  SHOW_LINKS_ERROR,
  SET_SELECTED_NODES_BY_SEARCH
} from 'react-components/tool/tool.actions';
import {
  TOOL_LINKS__CLEAR_SANKEY,
  TOOL_LINKS__HIGHLIGHT_NODE,
  TOOL_LINKS__SET_NODES,
  TOOL_LINKS__SET_MORE_NODES,
  TOOL_LINKS__SET_FLOWS_LOADING,
  TOOL_LINKS__SET_COLUMNS,
  TOOL_LINKS__SET_LINKS,
  TOOL_LINKS_RESET_SANKEY,
  TOOL_LINKS__SELECT_VIEW,
  TOOL_LINKS__SET_IS_SEARCH_OPEN,
  TOOL_LINKS__COLLAPSE_SANKEY,
  TOOL_LINKS__EXPAND_SANKEY,
  TOOL_LINKS__SELECT_COLUMN,
  TOOL_LINKS_SET_NO_LINKS_FOUND,
  TOOL_LINKS__SET_SELECTED_NODES,
  TOOL_LINKS__SET_SELECTED_RECOLOR_BY,
  TOOL_LINKS__SET_SELECTED_RESIZE_BY,
  TOOL_LINKS__SET_SELECTED_BIOME_FILTER
} from 'react-components/tool-links/tool-links.actions';
import { SET_CONTEXT } from 'actions/app.actions';
import immer from 'immer';
import createReducer from 'utils/createReducer';
import getNodesMetaUid from 'reducers/helpers/getNodeMetaUid';
import xor from 'lodash/xor';
import { deserialize } from 'react-components/shared/url-serializer/url-serializer.component';
import * as ToolLinksUrlPropHandlers from 'react-components/tool-links/tool-links.serializers';
import toolLinksInitialState from './tool-links.initial-state';

const toolLinksReducer = {
  tool(state, action) {
    if (action.payload?.serializerParams) {
      const newState = deserialize({
        params: action.payload.serializerParams,
        state: toolLinksInitialState,
        urlPropHandlers: ToolLinksUrlPropHandlers,
        props: [
          'selectedNodesIds',
          'selectedColumnsIds',
          'expandedNodesIds',
          'detailedView',
          'selectedResizeByName',
          'selectedRecolorByName',
          'selectedBiomeFilterName'
        ]
      });
      return newState;
    }
    return state;
  },
  [TOOL_LINKS__SET_FLOWS_LOADING](state, action) {
    const { loading } = action.payload;
    return immer(state, draft => {
      draft.flowsLoading = loading;
    });
  },
  [TOOL_LINKS_RESET_SANKEY](state) {
    return immer(state, draft => {
      Object.assign(draft, {
        noLinksFound: toolLinksInitialState.noLinksFound,
        selectedRecolorByName: toolLinksInitialState.selectedRecolorByName,
        selectedResizeByName: toolLinksInitialState.selectedResizeByName,
        selectedBiomeFilterName: toolLinksInitialState.selectedBiomeFilterName,
        detailedView: toolLinksInitialState.detailedView,
        forcedOverview: toolLinksInitialState.forcedOverview,
        highlightedNodeId: toolLinksInitialState.highlightedNodeId,
        selectedNodesIds: toolLinksInitialState.selectedNodesIds,
        expandedNodesIds: toolLinksInitialState.expandedNodesIds,
        selectedColumnsIds: toolLinksInitialState.selectedColumnsIds
      });
    });
  },
  [TOOL_LINKS__CLEAR_SANKEY](state) {
    return immer(state, draft => {
      Object.assign(draft, {
        highlightedNodeId: toolLinksInitialState.highlightedNodeId,
        selectedNodesIds: toolLinksInitialState.selectedNodesIds,
        expandedNodesIds: toolLinksInitialState.expandedNodesIds,
        detailedView: toolLinksInitialState.detailedView,
        forcedOverview: toolLinksInitialState.forcedOverview,
        selectedBiomeFilterName: toolLinksInitialState.selectedBiomeFilterName
      });
    });
  },
  [SET_CONTEXT](state) {
    return immer(state, draft => {
      Object.assign(draft, {
        selectedRecolorByName: toolLinksInitialState.selectedRecolorByName,
        selectedResizeByName: toolLinksInitialState.selectedResizeByName,
        selectedBiomeFilterName: toolLinksInitialState.selectedBiomeFilterName,
        detailedView: toolLinksInitialState.detailedView,
        highlightedNodeId: toolLinksInitialState.highlightedNodeId,
        selectedNodesIds: toolLinksInitialState.selectedNodesIds,
        expandedNodesIds: toolLinksInitialState.expandedNodesIds,
        selectedColumnsIds: toolLinksInitialState.selectedColumnsIds,
        data: toolLinksInitialState.data
      });
    });
  },

  [TOOL_LINKS__SET_COLUMNS](state, action) {
    return immer(state, draft => {
      const { columns } = action.payload;

      // TODO the API should have the info on which file to load (if any) per column
      const municipalitiesColumn = columns.find(column => column.name === 'MUNICIPALITY');
      const logisticsHubColumn = columns.find(column => column.name === 'LOGISTICS HUB');
      if (logisticsHubColumn && municipalitiesColumn) {
        logisticsHubColumn.useGeometryFromColumnId = municipalitiesColumn.id;
      }

      draft.data.columns = {};
      columns.forEach(column => {
        draft.data.columns[column.id] = column;
      });

      // TODO: if any selectedNode, make those columns visible (selected)
    });
  },

  [TOOL_LINKS__SET_NODES](state, action) {
    const { nodes } = action.payload;
    return immer(state, draft => {
      draft.data.nodes = {};
      draft.data.nodesByColumnGeoId = {};
      nodes.forEach(node => {
        draft.data.nodes[node.id] = node;
        draft.data.nodesByColumnGeoId[`${node.columnId}-${node.geoId}`] = node.id;
      });
    });
  },

  [TOOL_LINKS__SET_MORE_NODES](state, action) {
    const { nodes } = action.payload;
    return immer(state, draft => {
      nodes.forEach(node => {
        if (!draft.data.nodes) {
          draft.data.nodes = {};
        }
        if (!draft.data.nodesByColumnGeoId) {
          draft.data.nodesByColumnGeoId = {};
        }
        if (!draft.data.nodes[node.id]) {
          draft.data.nodes[node.id] = node;
          draft.data.nodesByColumnGeoId[`${node.columnId}-${node.geoId}`] = node.id;
        }
      });
    });
  },

  [TOOL_LINKS__SET_LINKS](state, action) {
    return immer(state, draft => {
      const { links, linksMeta } = action.payload;

      draft.data.nodeHeights = {};
      linksMeta.nodeHeights.forEach(nodeHeight => {
        draft.data.nodeHeights[nodeHeight.id] = nodeHeight;
      });

      draft.currentQuant = linksMeta.quant;
      draft.data.links = links;
    });
  },
  [SET_NODE_ATTRIBUTES](state, action) {
    return immer(state, draft => {
      if (action.payload?.data?.length > 0) {
        draft.data.nodeAttributes = {};
        action.payload.data.forEach(attribute => {
          if (typeof draft.data.nodeAttributes[attribute.node_id] !== 'undefined') {
            const uid = getNodesMetaUid(attribute.attribute_type, attribute.attribute_id);
            draft.data.nodeAttributes[attribute.node_id][uid] = attribute;
          } else {
            const uid = getNodesMetaUid(attribute.attribute_type, attribute.attribute_id);
            draft.data.nodeAttributes[attribute.node_id] = {
              [uid]: attribute
            };
          }
        });
      } else {
        draft.data.nodeAttributes = null;
      }
    });
  },
  [SHOW_LINKS_ERROR](state) {
    return immer(state, draft => {
      Object.assign(draft, { links: null, flowsLoading: false });
    });
  },
  [TOOL_LINKS__SET_SELECTED_BIOME_FILTER](state, action) {
    return immer(state, draft => {
      draft.selectedBiomeFilterName = action.payload.name;
    });
  },
  [TOOL_LINKS__SET_SELECTED_RECOLOR_BY](state, action) {
    return immer(state, draft => {
      draft.selectedRecolorByName = action.payload.name;
    });
  },
  [TOOL_LINKS__SET_SELECTED_RESIZE_BY](state, action) {
    return immer(state, draft => {
      draft.selectedResizeByName = action.payload.name;
    });
  },
  [TOOL_LINKS__SELECT_VIEW](state, action) {
    return immer(state, draft => {
      const { detailedView, forcedOverview } = action.payload;
      draft.detailedView = detailedView;
      draft.forcedOverview = forcedOverview;
    });
  },

  [TOOL_LINKS__SELECT_COLUMN](state, action) {
    return immer(state, draft => {
      const { columnId, columnIndex } = action.payload;
      if (!draft.selectedColumnsIds) {
        draft.selectedColumnsIds = [];
      }
      // TODO also update choropleth with default selected indicators
      if (!draft.selectedColumnsIds.includes(columnId)) {
        draft.selectedColumnsIds[columnIndex] = columnId;
      }
      draft.data.links = [];

      const isInColumn = nodeId => {
        const node = draft.data.nodes[nodeId];
        // The node could come from the search or URL and not be in the state yet
        if (!node) return true;
        const column = draft.data.columns[node.columnId];
        return column.group !== columnIndex;
      };

      draft.selectedNodesIds = state.selectedNodesIds.filter(isInColumn);
      draft.expandedNodesIds = state.expandedNodesIds.filter(isInColumn);
    });
  },
  [SET_SELECTED_NODES_BY_SEARCH](state, action) {
    return immer(state, draft => {
      const { results } = action.payload;
      const ids = results.map(n => n.id);

      const columns = Object.values(draft.data.columns || {});
      results.forEach(result => {
        const column = columns.find(c => c.name === result.nodeType);
        const { selectedColumnsIds } = draft;
        const needsColumnChange =
          (column.isDefault === false && !selectedColumnsIds) ||
          (column.isDefault === false && !selectedColumnsIds[column.group]) ||
          (selectedColumnsIds && selectedColumnsIds[column.group] !== column.id);
        if (needsColumnChange) {
          if (selectedColumnsIds) {
            draft.selectedColumnsIds.splice(column.group, 1, column.id);
          } else {
            draft.selectedColumnsIds = [];
            draft.selectedColumnsIds[column.group] = column.id;
          }
        }
      });

      const areNodesExpanded = draft.expandedNodesIds.length > 0;
      if (
        areNodesExpanded &&
        draft.selectedNodesIds.length === 1 &&
        draft.selectedNodesIds.includes(ids)
      ) {
        // we are unselecting the node that is currently expanded: shrink sankey and continue to unselecting node
        draft.expandedNodesIds = [];
      }

      draft.selectedNodesIds = xor(draft.selectedNodesIds, ids);
    });
  },
  [TOOL_LINKS__SET_SELECTED_NODES](state, action) {
    return immer(state, draft => {
      const { nodeIds } = action.payload;
      let hasChanged = false;
      let newSelectedNodes = [...draft.selectedNodesIds];
      nodeIds.forEach(nodeId => {
        const areNodesExpanded = draft.expandedNodesIds.length > 0;
        const node = draft.data.nodes[nodeId];
        if (node.isAggregated) {
          draft.isSearchOpen = true;
        } else {
          hasChanged = true;
          if (
            areNodesExpanded &&
            draft.selectedNodesIds.length === 1 &&
            draft.selectedNodesIds.includes(nodeId)
          ) {
            // we are unselecting the node that is currently expanded: shrink sankey and continue to unselecting node
            draft.expandedNodesIds = [];
          }

          newSelectedNodes = xor(newSelectedNodes, [nodeId]);
        }
      });
      if (hasChanged) {
        // save to state the new node selection
        draft.selectedNodesIds = newSelectedNodes;
        if (newSelectedNodes.length === 0) {
          draft.expandedNodesIds = [];
        }
      }
    });
  },
  [TOOL_LINKS__HIGHLIGHT_NODE](state, action) {
    return immer(state, draft => {
      draft.highlightedNodeId = action.payload.nodeId;
    });
  },
  [TOOL_LINKS__COLLAPSE_SANKEY](state) {
    return immer(state, draft => {
      draft.expandedNodesIds = [];
    });
  },
  [TOOL_LINKS__EXPAND_SANKEY](state) {
    return immer(state, draft => {
      draft.expandedNodesIds = state.selectedNodesIds;
    });
  },
  [RESET_TOOL_STATE](state, action) {
    return immer(state, draft => {
      Object.assign(draft, toolLinksInitialState, action.payload);
    });
  },
  [TOOL_LINKS__SET_IS_SEARCH_OPEN](state, action) {
    return immer(state, draft => {
      draft.isSearchOpen = action.payload.isSearchOpen;
    });
  },
  [TOOL_LINKS_SET_NO_LINKS_FOUND](state, action) {
    return immer(state, draft => {
      draft.noLinksFound = action.payload.noLinksFound;
    });
  }
};

const toolLinksReducerTypes = PropTypes => ({
  currentQuant: PropTypes.object,
  detailedView: PropTypes.bool,
  isSearchOpen: PropTypes.bool,
  forcedOverview: PropTypes.bool,
  expandedNodesIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  highlightedNodeId: PropTypes.number,
  flowsLoading: PropTypes.bool,
  selectedBiomeFilterName: PropTypes.string,
  selectedColumnsIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedNodesIds: PropTypes.arrayOf(PropTypes.number).isRequired,
  selectedRecolorByName: PropTypes.string,
  selectedResizeByName: PropTypes.string
});

export default createReducer(toolLinksInitialState, toolLinksReducer, toolLinksReducerTypes);
