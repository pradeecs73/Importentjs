'use strict';

define(["app"],
  function(app) {
    app.CommunityJoinrequestRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
         	return this.modelFor('community');
      }
    });
  });