"use strict";

define(["app", "text!templates/leftNav/formalLearning.hbs"],
    function(app, template) {
        App.FormalLearningView = Ember.View.extend({
            template: Ember.Handlebars.compile(template)
        });
        return app;
    });

