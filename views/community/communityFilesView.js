'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailFiles.hbs'],
    function(app, _, blogsTemplate) {
        app.CommunityFilesView = Ember.View.extend({
            template: Ember.Handlebars.compile(blogsTemplate)
        });
    });