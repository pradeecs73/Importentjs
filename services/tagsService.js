define(['httpClient'], function (httpClient) {
  return {
      allTags: function() {
      return httpClient.get("/knowledgecenter/pipeline/resources/tags");
    }
  }
});