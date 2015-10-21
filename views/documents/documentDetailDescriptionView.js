'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailDescription.hbs'],
    function(app, _, descriptionTemplate) {
        app.DocumentsDetailDescriptionView = Ember.View.extend({
            template: Ember.Handlebars.compile(descriptionTemplate),
            tagName: ''
        });
    });
