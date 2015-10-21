'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailBlogs.hbs'],
    function(app, _, blogsTemplate) {
        app.CommunityBlogsView = Ember.View.extend({
            template: Ember.Handlebars.compile(blogsTemplate)
        });
    });
