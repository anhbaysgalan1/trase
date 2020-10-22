import React from 'react';
import PropTypes from 'prop-types';
import { PROFILE_STEPS } from 'constants';
import 'react-components/shared/profile-selector/profile-panel/profile-panel.scss';
import BlockSwitch from 'react-components/shared/block-switch/block-switch.component';
import Heading from 'react-components/shared/heading';
import ProfileStepPanel from 'react-components/shared/profile-selector/profile-panel/profile-step-panel';
import getPanelStepName from 'utils/getProfilePanelName';
import ProfilesCommoditiesPanel from './profiles-commodity-panel.component';

function ProfilePanel(props) {
  const {
    step,
    setProfilesActiveItem,
    profileType,
    blocks,
    setProfilesPage,
    panels,
    data,
    loading
  } = props;

  // The heading needs to be extracted as unmounting and replacing the Heading causes a crash because of transifex
  const renderHeading = () => {
    const singularTypes = {
      sources: 'Source',
      traders: 'Trader',
      destinations: 'Importer country'
    };
    const chooseText = step === PROFILE_STEPS.commodities ? 'Choose the ' : 'Choose one ';
    const typeText = {
      [PROFILE_STEPS.type]: 'type of profile',
      [PROFILE_STEPS.profiles]: `${singularTypes[profileType]} profile`,
      [PROFILE_STEPS.commodities]: 'commodity'
    }[step];

    return (
      <Heading align="center" size="md" weight="light">
        {chooseText}
        <Heading as="span" size="md" weight="bold">
          {typeText}
        </Heading>
      </Heading>
    )
  };
  switch (step) {
    case PROFILE_STEPS.type:
      return (
        <div className="c-profile-panel">
          {renderHeading()}
          <div className="row profile-panel-content">
            <BlockSwitch
              blocks={blocks}
              selectBlock={item => setProfilesActiveItem(item, 'type')}
              activeBlockId={profileType}
            />
          </div>
        </div>
      );
    case PROFILE_STEPS.profiles: {
      return (
        <div className="c-profile-panel">
          {renderHeading()}
          <div className="row columns profile-panel-content">
            <ProfileStepPanel panelName={getPanelStepName(step)} />
          </div>
        </div>
      );
    }
    case PROFILE_STEPS.commodities:
      return (
        <div className="c-profile-panel">
          {renderHeading()}
          <div className="row columns profile-panel-content">
            <ProfilesCommoditiesPanel
              page={panels.commodities.page}
              getMoreItems={setProfilesPage}
              loadingMoreItems={panels.commodities.loadingItems}
              loading={loading}
              commodities={data.commodities}
              onSelectCommodity={item => setProfilesActiveItem(item, 'commodities')}
              activeCommodities={panels.commodities.activeItems}
            />
          </div>
        </div>
      );
    default:
      return null;
  }
}

ProfilePanel.propTypes = {
  step: PropTypes.number,
  setProfilesActiveItem: PropTypes.func.isRequired,
  profileType: PropTypes.string,
  blocks: PropTypes.array,
  setProfilesPage: PropTypes.func.isRequired,
  panels: PropTypes.object,
  data: PropTypes.object,
  loading: PropTypes.bool
};

export default ProfilePanel;
