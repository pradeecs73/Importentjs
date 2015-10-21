define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      sendUpdate: function (activity, applicationId) {
        return httpClient.put("/knowledgecenter/pipeline/{applicationId}/actions/" + activity.type + "?applicationId=" + applicationId , activity)
      },
      activities: function (activityType, resourceType, resourceId, applicationId) {
        return httpClient.get("/knowledgecenter/pipeline/{applicationId}/actions/" + activityType + "/" + resourceType + "/" + resourceId + "?applicationId=" + applicationId)
      },
      search: function (resourceType, params, activityParams) {
        if (!activityParams.hasOwnProperty("type")) {
          console.log("Type of activity is a compulsory param!!");
          console.log(activityParams);
          throw new Ember.Error("Type of activity is a compulsory param!!")
        }
        var searchText = params.searchText && params.searchText.length > 0 ? params.searchText : "*";
        var sortConfig = [];
        sortConfig.push({
            "sortBy" : params.sortBy,
            "sortOrder" : params.sortOrder
        });
        if(params.sortBy!= "uploadedOn") {
            sortConfig.push({
                "sortBy" : "uploadedOn",
                "sortOrder" : "desc"
            });
        }
        var wordSingularSimple = function(text){return text.substr(text.length-1) === "s" ? text.substr(0, text.length-1): text}
        var searchRequest = {
          type: wordSingularSimple(resourceType),
          filters: params.filters ? params.filters.split(";") : [],
          searchText: searchText,
          pageNumber: (params.pageNumber && params.pageNumber > 0) ? params.pageNumber : 1,
          pageSize: params.pageSize ? params.pageSize : app.PageSize,
          sortBy: sortConfig,
          activity: activityParams
        };
        return httpClient.post("/knowledgecenter/pipeline/actions/search", searchRequest)
      }
    };
  });