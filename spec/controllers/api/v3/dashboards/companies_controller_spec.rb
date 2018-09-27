require 'rails_helper'

RSpec.describe Api::V3::Dashboards::CompaniesController, type: :controller do
  include_context 'api v3 brazil flows quants'

  describe 'GET search' do
    before(:each) do
      Api::V3::Readonly::Dashboards::Company.refresh
    end
    it 'returns matching companies' do
      get :search, params: {
        countries_ids: [api_v3_brazil.id].join(','),
        q: 'afg'
      }
      expect(assigns(:collection).map(&:id)).to eq([api_v3_exporter1_node.id])
    end
  end
end
