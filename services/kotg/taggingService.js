define(['app', 'httpClient', 'underscore', 'Q'], function(app, httpClient, _, Q) {

    var fetchAllTags = function() {
        var endPoint = "/knowledgecenter/cloudlet/fetchTags/" + cloudletAppId + "/" + app.getUsername();
        return httpClient.getJson(endPoint);
    };

    var fetchSelectedTags = function(entityId, entityType) {
        var endPoint = "/knowledgecenter/cloudlet/fetchSelectedTags/" + cloudletAppId + "/" + app.getUsername() + "/" + entityId + "?entityType=" + entityType;
        return httpClient.getJson(endPoint);
    };

    var addUpdateTag = function(tagObj) {
        var endPoint = "/knowledgecenter/cloudlet/addTag/" + cloudletAppId + "/" + app.getUsername();
        return httpClient.post(endPoint, {
            "_id": tagObj._id,
            "title": tagObj.title
        });
    };

    var removeTag = function(tagObj) {
        var endPoint = "/knowledgecenter/cloudlet/removeTag/" + cloudletAppId + "/" + app.getUsername() + "/" + tagObj._id;
        return httpClient.remove(endPoint);
    }

    var applyTags = function(entityId, entityType, appliedTags) {
        var endPoint = "/knowledgecenter/cloudlet/applyTags/" + cloudletAppId + "/" + app.getUsername() + "/" + entityId + "?entityType=" + entityType;
        return httpClient.post(endPoint, appliedTags);
    };

    var addTag = function(newTag) {
        var endPoint = "/knowledgecenter/cloudlet/addTag/" + cloudletAppId + "/" + app.getUsername();
        return httpClient.post(endPoint, newTag);
    }

    return {
        fetchAllTags: fetchAllTags,
        fetchSelectedTags: fetchSelectedTags,
        addUpdateTag: addUpdateTag,
        removeTag: removeTag,
        applyTags: applyTags,
        addTag: addTag
    }
});