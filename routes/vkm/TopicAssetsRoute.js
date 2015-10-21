"use strict";

define(["app", "Q"],
    function (app, Q) {
        App.TopicAssetsRoute = Ember.Route.extend({
            setupControllers: function (controller, model) {
                controller.set("model", model);
            },
           

        });

    });