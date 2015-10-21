"use strict";

define(['emberValidator'],
    function() {
        var landingPageValidator = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: {
                email: {
                    presence: { message: 'This field is mandatory'},
                    format: {
                        with: /\S+@\S+\.\S+$/ ,
                        message: 'Invalid format for the email'
                    }
                }
            }
        });

        return landingPageValidator;
    });