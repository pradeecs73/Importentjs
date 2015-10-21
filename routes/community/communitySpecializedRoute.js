'use strict';

define(["app"],
  function(app) {
    app.CommunitySpecializedRoute = Ember.Route.extend({
            renderTemplate: function() {
                this.render()
            },

            setupController: function(controller, model) {
                controller.set('model', model);
                controller.populateRecommendedSkill(controller.get('model')._id, "3");
            },

            model: function() {
                return this.modelFor('community');
            }
    });
});