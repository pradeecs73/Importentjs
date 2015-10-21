'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailJoinRequests.hbs'
    ],
    function(app, _, requestsTemplate) {
        app.CommunitiesDetailJoinRequestsView = Ember.View.extend({
            template: Ember.Handlebars.compile(requestsTemplate),
            tagName: ''
        });
    });