"use strict";

define(['ember'], function(Ember) {
    var LandingPageRoute = Ember.Route.extend({
        setupController: function(controller, model) {
            controller.clearValidationErrors();
        }
    });

    return {
        LandingPageRoute : LandingPageRoute
    }
});
