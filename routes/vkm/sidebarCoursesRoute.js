"use strict";

define(["app", "Q"],
    function (app, Q) {
        App.sidebarCoursesRoute = Ember.Route.extend({
        	renderTemplate: function(){
        		this.render();
        	},
            setupControllers: function (controller, model) {
                controller.set("model", model);
            },
           

        });

    });