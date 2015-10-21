define(['httpClient'], function (httpClient) {
    return {
        statusFor: function (state, appId, resourceType, resourceId) {
            return httpClient.get("/knowledgecenter/pipeline/{applicationId}" + "/states/" + state + "/successful?rawResourceId="+ resourceId + "&resourceType=" + resourceType + "&applicationId=" + appId);
        },

        statusForVideo: function(state, appId, resourceType, resourceId) {
            return httpClient.get("/knowledgecenter/pipeline/{applicationId}/plugin/" + resourceType + "/" + resourceId + "/_external/" + state + "/successful?applicationId=" + appId);
        }
    };
});