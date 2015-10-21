'use strict';

define(['app',
        'underscore',
        'text!templates/playBookFoundational.hbs'],
    function(app, _, foundationalTemplate) {
        app.CommunityFoundationalView = Ember.View.extend({
            template: Ember.Handlebars.compile(foundationalTemplate)
        });
    });