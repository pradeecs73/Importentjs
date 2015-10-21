'use strict';

define(['app', 'text!templates/documents.hbs'],
    function (app, documentsTemplate) {
        app.DocumentsView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentsTemplate)
        });
    })