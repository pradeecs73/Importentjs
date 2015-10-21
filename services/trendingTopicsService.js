define(['httpClient', 'Q'], function(httpClient, Q) {
  return {
    trendingTopicsFor: function(topicName) {
      var topicNamePromise = Q.fcall(function() {
        return topicName;
      });

      var allOtherTrendingTopicsPromise = this.allOtherTrendingTopics(topicName);
      var documentItemsPromise = this.documentItemsFor(topicName);

      return Q.all([topicNamePromise, allOtherTrendingTopicsPromise, documentItemsPromise])
        .spread(function(topicName, allOtherTopics, documentItems) {
          return {
            topicName: topicName,
            allOtherTopics: allOtherTopics,
            documentItems: documentItems
          }
        });
    },

    documentItemsFor: function(topicName) {
      return httpClient.get("/knowledgecenter/documents?category=" + topicName);
    },

    allOtherTrendingTopics: function(topicName) {
      return httpClient.get("/knowledgecenter/documents/trending-topics").then(function(response) {
        return response.filter(function(item) {
          return item.name != topicName
        });
      });
    }
  }
});