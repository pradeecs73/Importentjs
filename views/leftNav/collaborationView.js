"use strict";

define(["app", "text!templates/leftNav/collaboration.hbs"],
    function(app, template) {
        App.CollaborationView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

