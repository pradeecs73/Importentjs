'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailProxyBloggers.hbs'],
    function(app, _, proxiesTemplate) {
        app.CommunityProxiesView = Ember.View.extend({
            template: Ember.Handlebars.compile(proxiesTemplate)
        });
    });