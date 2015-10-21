define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
    	relatedTopics: function (resourceType, params, activityParams) {
    	
    		//Topic Uri is passed as a parameter
    		
        var querypart = "topicURI=http://clks.cisco.com/km/sid_354634481";
        return httpClient.post("/kmap/showcase/topics/relatedTopics", querypart)
      }
    };
  });