require 'rails_helper'

RSpec.describe Admin::TopProfilesController, type: :controller do
  let(:user) { FactoryBot.create(:user) }
  before { sign_in user }
  before :each do
    allow(controller).to receive(:derive_top_profile_details).and_return(true)
  end
  let(:context) { FactoryBot.create(:api_v3_context) }

  describe 'POST create' do
    let(:valid_attributes) {
      {context_id: context.id, node_id: FactoryBot.create(:api_v3_node).id}
    }
    it 'redirects to index' do
      post :create, params: {
        context_id: context.id, api_v3_top_profile: valid_attributes
      }
      expect(response).to redirect_to(admin_context_top_profiles_path(context))
    end
  end

  describe 'PUT update' do
    let(:top_profile) {
      FactoryBot.create(
        :api_v3_top_profile, context: context, node: FactoryBot.create(:api_v3_node)
      )
    }
    let(:valid_attributes) {
      {context_id: context.id, node_id: FactoryBot.create(:api_v3_node).id }
    }
    it 'redirects to index' do
      put :update, params: {
        context_id: context.id, id: top_profile.id, api_v3_top_profile: valid_attributes
      }
      expect(response).to redirect_to(admin_context_top_profiles_path(context))
    end
  end
end