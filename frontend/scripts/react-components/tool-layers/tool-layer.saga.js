import { all, fork, put, takeLatest, select } from 'redux-saga/effects';
import { loadLinkedGeoIDs } from 'react-components/tool/tool.actions';
import { TOOL_LINKS__SET_SELECTED_NODES } from 'react-components/tool-links/tool-links.actions';

function* fetchinkedGeoIds() {
  function* getGeoIds(action) {
    const { nodeIds } = action.payload;
    const { nodes } = yield select(state => state.toolLinks.data);
    const isAggregated = nodeIds.every(id => nodes[id].isAggregated);
    if (!isAggregated) {
      // load related geoIds to show on the map
      yield put(loadLinkedGeoIDs());
    }
  }

  yield takeLatest(TOOL_LINKS__SET_SELECTED_NODES, getGeoIds);
}

export default function* toolLayersSaga() {
  const sagas = [fetchinkedGeoIds];
  yield all(sagas.map(saga => fork(saga)));
}
