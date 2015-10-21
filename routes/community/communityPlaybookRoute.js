'use strict';

define(["app"],
  function(app) {
    app.CommunityPlaybookRoute = Ember.Route.extend({
      renderTemplate: function() {
        this.render();
      },
      model:function(){
      	     return this.modelFor('community');
      },
      setupController: function(controller, model) {
             controller.set('model', model);           
        }
    });
  });