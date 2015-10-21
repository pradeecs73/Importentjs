'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailAuthor.hbs'],
    function(app, _, authorTemplate) {
        app.DocumentsDetailAuthorView = Ember.View.extend({
            template: Ember.Handlebars.compile(authorTemplate),
            tagName: ''
        });
    });
