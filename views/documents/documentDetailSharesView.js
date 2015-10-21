'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailShares.hbs'],
    function(app, _, sharesTemplate) {
        app.DocumentsDetailSharesView = Ember.View.extend({
            template: Ember.Handlebars.compile(sharesTemplate),
            tagName: ''
        });
    });
