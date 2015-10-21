'use strict'

define(
  [
    'app',
    'text!templates/emptyRssfeeds.hbs'
  ],
  function(app, emptyRssfeedsTemplate) {
    app.EmptyRssFeedsView = Ember.View.extend({
      template: Ember.Handlebars.compile(emptyRssfeedsTemplate)
    })
  })
