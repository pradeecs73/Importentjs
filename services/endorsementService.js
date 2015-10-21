define(['httpClient'], function (httpClient) {
    return {

        getEndorsements: function (userId, attributeType) {
            return httpClient.get("/knowledgecenter/userpi/user/" + userId + "/endorsement/" + attributeType)
        },

        getEndorsementsEndorsedByCurrentUser: function (userId, attributeType) {
            return httpClient.get("/knowledgecenter/userpi/user/" + userId + "/endorsement/" + attributeType + "/my")
        },

        addEndorsement: function (userId, attributeType, attributeId) {
            var endorsement = {'userId': userId, 'attributeType': attributeType, 'attributeId': attributeId}
            return httpClient.post("/knowledgecenter/userpi/user/" + userId + "/endorsement", endorsement)
        },

        removeEndorsement: function (userId, attributeType, attributeId) {
            return httpClient.remove("/knowledgecenter/userpi/user/" + userId + "/endorsement/" + attributeType + "/" + encodeURIComponent(attributeId))
        }
    }
});