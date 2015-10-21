'use strict'

define(
  [
    'app',
    'text!templates/rssfeeds.hbs',
    'pages/rssfeedsPage'
  ],
  function(app, rssfeedsTemplate, rssfeedsPage) {
    app.RssfeedsView = Ember.View.extend({
      template: Ember.Handlebars.compile(rssfeedsTemplate),
      didInsertElement: function(){
        rssfeedsPage.initialize();
      },
      willClearRender: function() {
        rssfeedsPage.undelegateEvents();
      }
    })
  })
