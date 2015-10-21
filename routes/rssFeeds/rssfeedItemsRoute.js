'use strict'

define(
  [
    'app',
    'services/usersService',
    'httpClient'
  ],
  function(app, usersService, httpClient) {
    app.RssfeedItemsRoute = Ember.Route.extend({
      model: function(params) {
        this.controllerFor('rssfeeds').set('rssFeedId',params.name);
        return usersService.rssFeedsForUserWithName(params.name).then(function(rssfeed) {
          var googleUrl = document.location.protocol + '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q=' + encodeURIComponent(rssfeed.url);

          return httpClient.getJson(googleUrl).then(function(response) {
            return response.responseData.feed.entries;
          });
        });
      }
    })
  })
