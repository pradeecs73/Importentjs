"use strict";

define(["app", "text!templates/users.hbs"],
  function(app, adminUsersTemplate) {
    App.UserManagementUsersView = Ember.View.extend({
      template: Ember.Handlebars.compile(adminUsersTemplate),

      willClearRender: function() {
        this.controller.set('searchText','')
        this.controller.set('searchBoxText','')
      }

    });
    return app;
  });

