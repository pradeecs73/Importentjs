define(['httpClient','services/pipelineResourceService'], function (httpClient, pipelineService) {
    return {
        fetchStateGraph: function (pipelineResourceId, pipelineResourceVersion, applicationId) {
            return httpClient.get("/knowledgecenter/pipeline/{applicationId}/statemachine/states?resourceId=" + pipelineResourceId + "&resourceVersion=" + pipelineResourceVersion+ "&applicationId=" + applicationId);
        },

        getStates: function (stateModel) {
            var self=this;
            if(stateModel.resourceId) {
                return this.fetchStateGraph(stateModel.resourceId, stateModel.resourceVersion, stateModel.sourceApplicationId);
            } else {
                return pipelineService.getResourceByRawResourceId(stateModel.resourceType, stateModel.rawResourceId)
                    .then(function(pipelineResource) {
                        if(!pipelineResource) {
                            throw new Error("Could not find pipeline resource with rawResourceId ["
                                +stateModel.rawResourceId+"] and type ["+stateModel.resourceType+"]")
                        }

                        return self.fetchStateGraph(pipelineResource.id, stateModel.resourceVersion ? stateModel.resourceVersion : pipelineResource.version, stateModel.sourceApplicationId);
                    })
            }
        }
    };
});