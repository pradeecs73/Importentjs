'use strict'

define(
  [
    'app',
    'text!templates/rssfeed.hbs'
  ],
  function(app, rssfeedTemplate) {
    app.RssfeedItemsView = Ember.View.extend({
      template: Ember.Handlebars.compile(rssfeedTemplate)
    })
  })
