define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
      topicOrg: function (resourceType, params, activityParams) {
    	  
        var postTopicFootprint = {"organizations":["http://clks.cisco.com/km/department/TechnicalAssistanceCenterIndia"]};
        return httpClient.post("/kmap/showcase/topicFootprint", postTopicFootprint)
      }
    };
  });