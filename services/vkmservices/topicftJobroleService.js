define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
      topicJobrole: function (resourceType, params, activityParams) {
    	  
        var postTopicFootprint = {"jobRoles":["http://clks.cisco.com/km/job-role/EngineerNetworking"]};
        return httpClient.post("/kmap/showcase/topicFootprint", postTopicFootprint)
      }
    };
  });