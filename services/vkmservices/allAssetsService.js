define(['httpClient'], function (httpClient) {
  return {
				 allAssetsDocs : function() {
					return httpClient
							.get("kmap/showcase/assets?assetType=document&topicString=data center consolidation&view=extended");
				},
				allAssetsWikis : function() {
					return httpClient
							.get("kmap/showcase/assets?assetType=wiki&topicString=data center consolidation&view=extended");
				},
				allAssetsBlogs : function() {
					return httpClient
							.get("kmap/showcase/assets?assetType=blog&topicString=data center consolidation&view=extended");
				},
				allAssetsForums : function() {
					return httpClient
							.get("kmap/showcase/assets?assetType=forum&topicString=data center consolidation&view=extended");
				}
  }
});