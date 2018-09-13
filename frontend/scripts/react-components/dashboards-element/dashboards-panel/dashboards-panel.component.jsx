import React from 'react';
// import PropTypes from 'prop-types';
import BlockSwitch from 'react-components/shared/block-switch.component';
import SourcingPanel from 'react-components/dashboards-element/dashboards-panel/sourcing-panel.component';

class DashboardsPanel extends React.PureComponent {
  state = {
    activePanelId: null,
    sourcingPanel: {
      activeCountryId: null,
      activeJurisdictionValueId: null,
      activeJurisdictionTabId: 'biome'
    }
  };

  panels = [
    { id: 'sourcing', title: 'sourcing places' },
    { id: 'importing', title: 'importing countries' },
    { id: 'companies', title: 'companies' },
    { id: 'commodities', title: 'commodities' }
  ];

  countries = [
    { name: 'tupac' },
    { name: 'kanye' },
    { name: 'eminem' },
    { name: 'biggie' }
    // { name: 'jay z' },
    // { name: 'drake' }
  ];

  jurisdictionTabs = ['biome', 'state'];

  jurisdictionValues = {
    biome: [
      { name: 'Amazonia' },
      { name: 'Cerrado' },
      { name: 'Mata Atlántica' },
      { name: 'Pampa' }
    ],
    state: [
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' },
      { name: 'Acre' },
      { name: 'Alagoas' },
      { name: 'Amapa' },
      { name: 'Amazonas' },
      { name: 'Cearra' },
      { name: 'Distrito Federal' },
      { name: 'Espirito Santo' },
      { name: 'Goias' },
      { name: 'Maranhao' },
      { name: 'Mato Grosso' },
      { name: 'Mato Grosso do Sul' }
    ]
  };

  render() {
    const { activePanelId, sourcingPanel } = this.state;
    const dirtyBlocks = { sourcing: sourcingPanel.activeCountryId !== null };

    return (
      <div className="c-dashboards-panel">
        <h2 className="dashboard-panel-title title -center -medium -light">
          Choose the options you want to add to the dashboard
        </h2>
        <BlockSwitch
          blocks={this.panels}
          selectBlock={id => this.setState({ activePanelId: id })}
          activeBlockId={activePanelId}
          dirtyBlocks={dirtyBlocks}
        />
        {activePanelId === 'sourcing' && (
          <SourcingPanel
            activeCountryId={sourcingPanel.activeCountryId}
            activeJurisdictionTabId={sourcingPanel.activeJurisdictionTabId}
            activeJurisdictionValueId={sourcingPanel.activeJurisdictionValueId}
            countries={this.countries}
            tabs={this.jurisdictionTabs}
            jurisdictions={this.jurisdictionValues}
            onSelectCountry={country =>
              this.setState({ sourcingPanel: { ...sourcingPanel, activeCountryId: country.name } })
            }
            onSelectJurisdictionTab={tab =>
              this.setState({ sourcingPanel: { ...sourcingPanel, activeJurisdictionTabId: tab } })
            }
            onSelectJurisdictionValue={item =>
              this.setState({
                sourcingPanel: { ...sourcingPanel, activeJurisdictionValueId: item.name }
              })
            }
          />
        )}
      </div>
    );
  }
}

export default DashboardsPanel;
