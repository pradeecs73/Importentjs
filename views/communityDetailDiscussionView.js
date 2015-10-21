'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailDiscussion.hbs'],
    function(app, _, discussionTemplate) {
        app.CommunitiesDetailDiscussionView = Ember.View.extend({
            template: Ember.Handlebars.compile(discussionTemplate),
            tagName: ''
        });
    });
