'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailTitle.hbs'],
    function(app, _, titleTemplate) {
        app.DocumentsDetailTitleView = Ember.View.extend({
            template: Ember.Handlebars.compile(titleTemplate),
            tagName: ''
        });
    });
