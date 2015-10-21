'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailTags.hbs'],
    function(app, _, tagsTemplate) {
        app.CommunitiesDetailTagsView = Ember.View.extend({
            template: Ember.Handlebars.compile(tagsTemplate),
            tagName: ''
        });
    });
