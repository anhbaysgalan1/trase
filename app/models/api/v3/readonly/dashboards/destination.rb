# == Schema Information
#
# Table name: dashboards_destinations_mv
#
#  id(id of destination node (not unique))                         :integer          primary key
#  node_type_id                                                    :integer
#  country_id(id of country sourcing commodity going to this node) :integer
#  commodity_id(id of commodity going to this node)                :integer
#  node_id(id of another node from the same supply chain)          :integer
#  name                                                            :text
#  name_tsvector                                                   :tsvector
#  node_type                                                       :text
#  profile                                                         :text
#
# Indexes
#
#  dashboards_destinations_mv_commodity_id_idx   (commodity_id)
#  dashboards_destinations_mv_country_id_idx     (country_id)
#  dashboards_destinations_mv_name_tsvector_idx  (name_tsvector) USING gin
#  dashboards_destinations_mv_node_id_idx        (node_id)
#  dashboards_destinations_mv_node_type_id_idx   (node_type_id)
#  dashboards_destinations_mv_unique_idx         (id,node_id,country_id,commodity_id) UNIQUE
#

module Api
  module V3
    module Readonly
      module Dashboards
        class Destination < Api::Readonly::BaseModel
          include Api::V3::Readonly::MaterialisedTable

          self.table_name = 'dashboards_destinations'
          belongs_to :node

          class << self
            def refresh_dependencies(options = {})
              Api::V3::Readonly::NodesPerContextRankedByVolumePerYear.refresh(
                options.merge(skip_dependents: true)
              )
            end
          end

          INDEXES = [
            {columns: :commodity_id},
            {columns: :country_id},
            {columns: :name_tsvector, using: :gin},
            {columns: :node_type_id}
          ].freeze
        end
      end
    end
  end
end
