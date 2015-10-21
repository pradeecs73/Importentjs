"use strict";

define(["app", "text!templates/roles.hbs"],
    function(app, adminRolesTemplate) {
        App.UserManagementRolesView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminRolesTemplate)
        });
        return app;
    });

