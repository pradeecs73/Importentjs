define(['httpClient'], function (httpClient) {
  return {
	  forumAssets: function() {
      return httpClient.get("/kmap/showcase/bhaimia_thoughtworks_com/assets?assetType=forum&topicString=Data");
    }
  }
});