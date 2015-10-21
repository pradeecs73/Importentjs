define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
      
    	allCommunities: function (resourceType, params, activityParams) {
    	
    		//Topic Uri is passed as a parameter
    		
        var querypart = "topicTag=big data&limit=10";
        return httpClient.post("/kmap/showcase/communities", querypart)
      }
    };
  });