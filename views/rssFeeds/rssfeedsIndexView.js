'use strict'

define(
  ['app','pages/rssfeedsPage'], function(app, rssfeedsPage) {
    app.RssfeedsIndexView = Ember.View.extend({
      didInsertElement: function() {
        var rssfeeds = this.controller.controllerFor('rssfeeds').get('model')
        if (rssfeeds.length > 0 && !rssfeedsPage.smallerScreen()) {
          this.controller.transitionToRoute("rssfeedItems", rssfeeds[0]._id)
        }
      }
    })
  })
