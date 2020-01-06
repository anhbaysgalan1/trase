# == Schema Information
#
# Table name: nodes_with_flows
#
#  id              :integer          not null, primary key
#  context_id      :integer          not null
#  main_id         :integer
#  column_position :integer
#  is_subnational  :boolean
#  name            :text
#  node_type       :text
#  profile         :text
#  geo_id          :text
#  role            :text
#  name_tsvector   :tsvector
#  years           :integer          is an Array
#
# Indexes
#
#  nodes_with_flows_context_id_idx     (context_id)
#  nodes_with_flows_name_tsvector_idx  (name_tsvector)
#

module Api
  module V3
    module Readonly
      class NodeWithFlows < Api::Readonly::BaseModel
        include Api::V3::Readonly::MaterialisedTable

        self.table_name = 'nodes_with_flows'
        belongs_to :context

        include PgSearch::Model
        pg_search_scope :search_by_name, lambda { |query|
          {
            query: query,
            against: :name,
            using: {
              tsearch: {
                prefix: true,
                tsvector_column: :name_tsvector,
                normalization: 2
              }
            },
            order_within_rank: sanitize_sql_for_order(
              [Arel.sql('levenshtein(name, ?), name'), query]
            )
          }
        }

        INDEXES = [
          {columns: :context_id},
          {columns: :name_tsvector, using: :gin}
        ].freeze

        def self.select_options
          select(:id, :name, :node_type).order(:name).map do |node|
            ["#{node.name} (#{node.node_type})", node.id]
          end
        end
      end
    end
  end
end