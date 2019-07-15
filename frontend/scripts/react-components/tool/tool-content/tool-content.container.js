import { connect } from 'react-redux';
import { mapToVanilla } from 'react-components/shared/vanilla-react-bridge.component';
import ToolContent from 'react-components/tool/tool-content/tool-content.component';
import { resetSankey } from 'react-components/tool-links/tool-links.actions';

const mapStateToProps = state => ({
  isMapVisible: state.toolLayers.isMapVisible,
  isVisible: state.app.isMapLayerVisible,
  loading: state.toolLinks.flowsLoading || state.toolLayers.mapLoading,
  noLinksFound: state.toolLinks.noLinksFound
});

const mapDispatchToProps = {
  resetSankey: () => resetSankey()
};

const methodProps = [
  { name: 'showLoader', compared: ['loading'], returned: ['loading'] },
  { name: 'toggleMapVisibility', compared: ['isMapVisible'], returned: ['isMapVisible'] },
  { name: 'toggleMapLayersVisibility', compared: ['isVisible'], returned: ['isVisible'] },
  { name: 'toggleError', compared: ['noLinksFound'], returned: ['noLinksFound'] }
];

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(mapToVanilla(ToolContent, methodProps, Object.keys(mapDispatchToProps)));