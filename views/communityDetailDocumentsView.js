'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailDocuments.hbs'],
    function(app, _, documentsTemplate) {
        app.CommunitiesDetailDocumentsView = Ember.View.extend({
            template: Ember.Handlebars.compile(documentsTemplate),
            tagName: ''
        });
    });
