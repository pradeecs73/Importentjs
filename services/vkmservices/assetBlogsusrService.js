define(['httpClient'], function (httpClient) {
  return {
	  blogAssets: function() {
      return httpClient.get("/kmap/showcase/bhaimia_thoughtworks_com/assets?assetType=blog&topicString=Data");
    }
  }
});