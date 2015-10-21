"use strict";

define(["app", "services/registrationsService", 'underscore'],
  function(app, registrationsService, _) {

    app.AdminRegistrationItemController = Ember.ObjectController.extend({
      registrationErrorMessage: "",
      actions: {
          reject: function() {
              var self = this;
              var registration = self.get('model');
              return registrationsService.reject(registration.id)
                  .then(function() {
                      var parentController = self.parentController;
                      var parentModel = parentController.get('model');
                      var allRegistrations = parentModel.allRegistrations;
                      allRegistrations.removeObject(registration);
                  }).fail(function() {
                      self.set('registrationErrorMessage', 'Your request could not be processed. Please try again later');
                      Ember.run.later(self, function(){self.set('registrationErrorMessage', '')}, 3000)
                  });
          },
          accept: function() {
              var self = this;
              var registration = self.get('model');
              return registrationsService.accept(registration.id)
                  .then(function() {
                      var parentController = self.parentController;
                      var parentModel = parentController.get('model');
                      var allRegistrations = parentModel.allRegistrations;
                      allRegistrations.removeObject(registration);
                  }).fail(function(error) {
                      self.set('registrationErrorMessage', 'Your request could not be processed. Please try again later');
                      Ember.run.later(self, function(){self.set('registrationErrorMessage', '')}, 3000)
                  });
          }
      }
    });

    return app;
  });
