'use strict'

define(
  [
    'app',
    'services/usersService',
    'httpClient'
  ],
  function(app, usersService, httpClient) {
    app.RssfeedsEditRoute = Ember.Route.extend({
      model: function(params) {
      }
    })
  })