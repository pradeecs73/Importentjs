"use strict";

define(["app", "text!templates/leftNav/knowledgeCenter.hbs"],
    function(app, adminRolesTemplate) {
        App.KnowledgeCenterView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminRolesTemplate)
        });
        return app;
    });

