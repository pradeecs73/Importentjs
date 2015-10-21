"use strict";

define(["app", "text!templates/leftNav/peopleLeftNav.hbs"],
    function(app, template) {
        App.PeopleLeftNavView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

