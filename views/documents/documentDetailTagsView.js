'use strict';

define(['app',
        'underscore',
        'text!templates/documents/documentDetailTags.hbs'],
    function(app, _, tagsTemplate) {
        app.DocumentsDetailTagsView = Ember.View.extend({
            template: Ember.Handlebars.compile(tagsTemplate),
            tagName: ''
        });
    });
