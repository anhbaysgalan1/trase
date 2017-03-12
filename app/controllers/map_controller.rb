class MapController < ApplicationController

  def index
    dimension_groups = LayerGroup.select('distinct name, layer_group.id as id, layer_group.position')
                       .joins('LEFT JOIN layer ON layer.layer_group_id = layer_group.id')
                       .order('layer_group.position ASC, layer_group.id ASC')

    dimensions = Layer.select('layer.id as id, layer_attribute_id, COALESCE (inds.frontend_name, quants.frontend_name) as name, lower(layer_attribute_type) as type, bucket_3, bucket_5, layer.layer_group_id as group_id, COALESCE (inds.unit, quants.unit) as unit, is_default')
                 .joins('LEFT JOIN layer_group ON layer.layer_group_id = layer_group.id')
                 .joins('LEFT JOIN quants ON layer_attribute_type =\'Quant\' AND layer_attribute_id = quants.quant_id')
                 .joins('LEFT JOIN inds ON layer_attribute_type =\'Ind\' AND layer_attribute_id = inds.ind_id')
                 .where('context_id = :context_id', context_id: @context.id)
                 .order('layer.position ASC')


    serialized_layer_groups = ActiveModelSerializers::SerializableResource.new(dimension_groups, {each_serializer: DimensionGroupSerializer, root: 'dimensionGroups'}).serializable_hash
    serialized_layers = ActiveModelSerializers::SerializableResource.new(dimensions, {each_serializer: DimensionSerializer, root: 'dimensions'}).serializable_hash

    render json: serialized_layer_groups.merge(serialized_layers)
  end

end
