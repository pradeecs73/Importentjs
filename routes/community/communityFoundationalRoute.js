'use strict';

define(["app","services/groupService"],
  function(app, groupService) {
    app.CommunityFoundationalRoute = Ember.Route.extend({

	    renderTemplate: function() {
	        this.render();
	    },
	    model:function(){
			return this.modelFor('community');
	    },
	    setupController: function(controller, model) {
            controller.set('model', model);
            controller.populateRecommendedSkill(controller.get('model')._id, "1");
		}

    });
  });