define(['httpClient', 'Q'], function (httpClient, Q) {
  return {
    getAllResources: function (resourceType, pluginType) {
      if(pluginType == "all") {
        return Q([]);
      }
      var url = "";
      var deferred = Q.defer();

      if (window.like && window.like.getConfig()) {
        var config = window.like.getConfig();
        url += "/knowledgecenter/cloudlet";
        url += "/" + pluginType + "/";
        url += config.appId + "/" + config.userName;
        url += "?entityType=" + resourceType;
        return httpClient.get(url);
      }
      console.log("Cloudlet service is not available.")
      deferred.reject("Cloudlet service is not available");
      return deferred.promise;
    },

    getLikesCount: function(idList, type) {
      var url = "";

      if (window.like && window.like.getConfig()) {
        var config = window.like.getConfig();
        url += "/knowledgecenter/cloudlet/" + config.pluginType + "/" + config.appId;
        url += "?entityType=" + type +"&entityIdList=" + idList.join(",");
      }
      return httpClient.get(url);
    }
  };
})