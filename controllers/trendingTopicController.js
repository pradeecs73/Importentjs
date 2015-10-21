'use strict';

define(['app', 'text!templates/trendingTopic.hbs', 'httpClient', 'pages/documentItems', 'services/trendingTopicsService', 'controllers/documentItemController'], function (app, trendingTopicTemplate, httpClient, documentItems, trendingTopicsService) {
  app.TrendingTopicView = Ember.View.extend({
    template: Ember.Handlebars.compile(trendingTopicTemplate),
    toggleView: function (view) {
      this.controller.set('_currentView', view);
    }
  });

  app.TrendingTopicRoute = Ember.Route.extend({
    model: function (params) {
      return trendingTopicsService.trendingTopicsFor(params['topic_name']);
    }
  });

  app.TrendingTopicController = Ember.ObjectController.extend({
    //Do Not Remove - Used in the child controller documentItemController
    _currentView: "grid-view",

    isGridView: function() {
      return this.get('_currentView') == 'grid-view';
    }.property("_currentView")
  });
});
