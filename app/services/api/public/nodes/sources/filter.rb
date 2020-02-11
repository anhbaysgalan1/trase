module Api
  module Public
    module Nodes
      module Sources
        class Filter < Api::Public::Nodes::Filter
          private

          def initialize_query
            @query = Api::V3::Readonly::NodeWithFlows.where(
              role: Api::V3::ContextNodeTypeProperty::SOURCE_ROLE
            )
          end
        end
      end
    end
  end
end