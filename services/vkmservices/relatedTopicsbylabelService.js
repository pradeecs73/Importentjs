define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
    	relatedTopicsbylabel: function (resourceType, params, activityParams) {
    	
    		//Topic Uri is passed as a parameter
    		
        var querypart = "topicLabel=rest client driver";
        return httpClient.post("/kmap/showcase/topics/relatedTopicsByLabel", querypart)
      }
    };
  });