'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailTitle.hbs'],
    function(app, _, titleTemplate) {
        app.CommunitiesDetailTitleView = Ember.View.extend({
            template: Ember.Handlebars.compile(titleTemplate),
            tagName: ''
        });
    });
