define(['httpClient'], function (httpClient) {
  return {
	  wikiAssets: function() {
      return httpClient.get("/kmap/showcase/bhaimia_thoughtworks_com/assets?assetType=wiki&topicString=Data");
    }
  }
});