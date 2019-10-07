import { connect } from 'react-redux';
import VersioningModal from 'react-components/tool/tool-modal/versioning-modal/versioning-modal.component';
import { getSelectedContext } from 'reducers/app.selectors';
import { getVersionData } from 'react-components/tool/tool-modal/versioning-modal/versioning-modal.selectors';

const mapStateToProps = state => ({
  data: getVersionData(state),
  context: getSelectedContext(state)
});

export default connect(
  mapStateToProps,
  null
)(VersioningModal);
