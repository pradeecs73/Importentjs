"use strict";

define(["app", 'emberValidator'],
  function(app) {

    app.AdminExpertiseItem = Ember.Object.extend(Ember.Validations.Mixin, {
      validations: {
        expertise: {
          format: {
            with: /^[^,//":]+$/,
            without: /^([^a-z 0-9 A-Z])+$/,
            allowBlank: false,
            message: 'The Area of expertise cannot contain quotes (") comma (,) forward slash (/) and colon (:) and needs to contain at least one alphanumeric character. '
          },
          length: {
            minimum: 1,
            maximum: 50,
            messages: {
              minimum: 'Please enter at least 1 valid character',
              maximum: 'Maximum length allowed is 50 characters'
            }
          }
        }
      }
    });

    return app;
  });
