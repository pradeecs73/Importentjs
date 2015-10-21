"use strict";

define(["app", "Q"],
    function (app, Q) {
        App.TopicCommunityRoute = Ember.Route.extend({
            setupControllers: function (controller, model) {
                controller.set("model", model);
               
            },
           
        });

    });