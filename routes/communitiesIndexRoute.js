'use strict';

define(["app"],
  function(app) {
    app.CommunitiesIndexRoute = Ember.Route.extend({
      redirect: function() {
        this.transitionTo("communities.my");
      }
    });
  });

