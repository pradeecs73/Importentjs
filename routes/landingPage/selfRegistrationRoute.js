"use strict";

define(["ember", 'services/landingAppService'], function(Ember, landingAppService) {
    var SelfRegistrationRoute = Ember.Route.extend({
        beforeModel: function(transition) {
            var username = transition.queryParams["username"];
            if(!username) {
                window.location = "/";
            }
            return landingAppService.isSSOEnabled().then(function (response) {
                if (response.ssoEnabled) {
                    window.location = "/";
                } else {
                    return landingAppService.getUserStatus(username).then(function (response) {
                        switch(response.status) {
                            case "registered":
                                window.location = "/";
                                break;
                            case "pending":
                                window.location = "/";
                                break;
                        }
                    });
                }
            });
        },
        setupController: function(controller, model) {
            controller.clearValidationErrors();
        }
    });

    return {
        SelfRegistrationRoute: SelfRegistrationRoute
    }
});
