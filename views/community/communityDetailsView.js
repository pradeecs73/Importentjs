'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailDescription.hbs'],
    function(app, _, blogsTemplate) {
        app.CommunityDetailsView = Ember.View.extend({
            template: Ember.Handlebars.compile(blogsTemplate)
        });
    });