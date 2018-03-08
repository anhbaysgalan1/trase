import { connect } from 'react-redux';
import routerLinks from 'router/nav-links';
import { getStaticContentFilename } from 'react-components/static-content/static-content.actions';
import SidebarNav from './sidebar-nav.component';

function mapStateToProps(state) {
  const { location } = state;
  const filename = getStaticContentFilename(location);
  const links = routerLinks[filename] || routerLinks.sidebarNav;

  return {
    links,
    location // forcing to re-render when location has changed
  };
}

export default connect(mapStateToProps)(SidebarNav);
