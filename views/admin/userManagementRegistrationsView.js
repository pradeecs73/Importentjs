"use strict";

define(["app", "text!templates/registrations.hbs"],
  function (app, adminRegistrationsTemplate) {

    app.UserManagementRegistrationsView = Ember.View.extend({
      template: Ember.Handlebars.compile(adminRegistrationsTemplate),

      didInsertElement: function () {
        this.controller.set('successMessage', '');
      }

    });

    return app;
  });
