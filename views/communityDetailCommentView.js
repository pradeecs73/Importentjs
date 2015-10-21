'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailComment.hbs'],
    function(app, _, commentTemplate) {
        app.CommunitiesDetailCommentView = Ember.View.extend({
            template: Ember.Handlebars.compile(commentTemplate),
            tagName: ''
        });
    });
