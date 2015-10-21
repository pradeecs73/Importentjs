define(['httpClient'], function (httpClient) {
    return {
        getResourceByRawResourceId: function (resourceType, resourceId, applicationId) {
            return httpClient.get("/knowledgecenter/pipeline/{applicationId}/plugin/"+ resourceType +"/"+resourceId + "?applicationId=" + applicationId);
        }
    };
});