'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailMembers.hbs'],
    function(app, _, membersTemplate) {
        app.CommunitiesDetailMembersView = Ember.View.extend({
            template: Ember.Handlebars.compile(membersTemplate),
            tagName: ''
        });
    });
