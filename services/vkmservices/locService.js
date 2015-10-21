define(['httpClient'], function (httpClient) {
  return {
	  allLocations: function() {
      return httpClient.get("/kmap/showcase/locations");
    }
  }
});