"use strict";

define(["app", "text!templates/leftNav/homeLeftNav.hbs"],
    function(app, template) {
        App.HomeLeftNavView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

