define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
    	topicActivity: function (resourceType, params, activityParams) {
    	  
        var postTopicFootprint = { "persons" : ["http://clks.cisco.com/km...haimia_thoughtworks_com"]  };
        return httpClient.post("/kmap/showcase/topicFootprint?view=extended", postTopicFootprint)
      }
    };
  });