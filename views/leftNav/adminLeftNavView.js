"use strict";

define(["app", "text!templates/leftNav/adminLeftNav.hbs"],
    function(app, template) {
        App.AdminLeftNavView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

