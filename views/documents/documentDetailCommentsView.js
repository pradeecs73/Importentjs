'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailComments.hbs'],
    function(app, _, commentsTemplate) {
        app.DocumentsDetailCommentsView = Ember.View.extend({
            template: Ember.Handlebars.compile(commentsTemplate),
            tagName: ''
        });
    });
