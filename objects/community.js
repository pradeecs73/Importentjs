'use strict';

define(["app", "emberValidator"],
    function(app) {
        app.Community = Ember.Object.extend(Ember.Validations.Mixin, {
            validations: {
                name: {
                    presence: {
                        message: "Community name cannot be empty"
                    },

                    length: {
                        minimum: 3,
                        maximum: 50,
                        messages: {
                            minimum: 'Please enter at least 3 valid characters',
                            maximum: 'Please enter less than 50 characters'
                        }
                    },
                    format: {
                        with: /^[a-zA-Z0-9\s\w\-_&!:;\/@]*$/,
                        message: "Invalid format. Community names can only contain letters, numbers, spaces, and the following special characters ( _ & ; :  - ! @ /)"
                    }
                },
                description: {
                    presence: {
                        message: "Description can't be blank"
                    }
                },
                descriptionSansHtml: {
                    presence: {
                        message: "Description can't be blank"
                    }
                },
                members: {
                    format: {
                        with: /^((\w+([-+.']\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*)*([,])*)*$/,
                        allowBlank: true,
                        message: "Members should be a comma separated value of valid email addresses"
                    }
                },
                tags: {
                    format: {
                        with: /^[^":]+$/,
                        allowBlank: true,
                        message: 'Tags contain quotes (") and colon (:)'
                    }
                },
                category: {
                    presence: {
                        message: "Please choose one of the category"
                    }
                }
            }
        });
    });