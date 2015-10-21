define(['httpClient'], function (httpClient) {
  return {
	  allTopics: function() {
      return httpClient.get("/kmap/showcase/topicsList");
    }
  }
});