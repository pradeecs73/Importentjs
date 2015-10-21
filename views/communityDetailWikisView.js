'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailWikis.hbs'],
    function(app, _, wikisTemplate) {
        app.CommunitiesDetailWikisView = Ember.View.extend({
            template: Ember.Handlebars.compile(wikisTemplate),
            tagName: ''
        });
    });
