'use strict';

define(['app', 'text!templates/trendingTopics.hbs', 'pages/trendingTopics', 'httpClient'], function(app, trendingTopicsTemplate, trendingTopics, httpClient) {
  app.TrendingTopicsIndexView = Ember.View.extend({
    template: Ember.Handlebars.compile(trendingTopicsTemplate),
    templateName: "trendingTopics",

    didInsertElement: function() {
      trendingTopics.initialize();
    }
  });

  app.TrendingTopicsIndexRoute = Ember.Route.extend({
    model: function() {
      return httpClient.get("/knowledgecenter/documents/trending-topics");
    }
  });
});
