"use strict";

define(['emberValidator'],
    function() {
            var selfRegistrationValidator = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: {
                username: {
                    presence: { message: 'This field is mandatory'},
                    format: {
                        with: /\S+@\S+\.\S+$/ ,
                        message: 'Invalid format for the username'
                    }
                },
                firstName: {
                    presence: { message: 'This field is mandatory'},
                }
            }
        });

        return  selfRegistrationValidator;
    });