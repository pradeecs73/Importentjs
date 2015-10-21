"use strict";

define(["app", "text!templates/leftNav/manager.hbs"],
    function(app, template) {
        App.ManagerView= Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

