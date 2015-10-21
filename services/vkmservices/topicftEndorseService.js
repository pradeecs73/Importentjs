define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
      topicEndorse: function (resourceType, params, activityParams) {
    	  
        var postTopicFootprint = { "persons" : ["http://clks.cisco.com/km...haimia_thoughtworks_com"]  };
        console.log('postTopicFootprint: '+JSON.stringify(postTopicFootprint));
        return httpClient.post("/kmap/showcase/topicFootprint", postTopicFootprint)
      }
    };
  });