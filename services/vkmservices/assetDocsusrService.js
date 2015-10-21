define(['httpClient'], function (httpClient) {
  return {
	  docAssets: function() {
      return httpClient.get("/kmap/showcase/bhaimia_thoughtworks_com/assets?assetType=document&topicString=Data");
    }
  }
});