'use strict';

define(['app',
        'underscore',
        'text!templates/playBookSpecialized.hbs'],
    function(app, _, specializedTemplate) {
        app.CommunitySpecializedView = Ember.View.extend({
            template: Ember.Handlebars.compile(specializedTemplate)
        });
    });