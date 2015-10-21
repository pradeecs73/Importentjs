define(['app', 'httpClient'],
  function (app, httpClient) {
    return {
        
    	allExperts: function (resourceType, params) {
    	
        var params = "topicURI=http://clks.cisco.com/km/627";
        var userId = "bhiki";
        return httpClient.post("/kmap/showcase/"+userId+"/experts", params)
      }
    };
  });