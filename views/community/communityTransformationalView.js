'use strict';

define(['app',
        'underscore',
        'text!templates/playBookTransformational.hbs'],
    function(app, _, transformationalTemplate) {
        app.CommunityTransformationalView = Ember.View.extend({
            template: Ember.Handlebars.compile(transformationalTemplate)
        });
    });