'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailAuthor.hbs','controllers/collaboration/utils/postUtil'],
    function(app, _, authorTemplate,postUtil) {
        app.CommunitiesDetailAuthorView = Ember.View.extend({
        	confirmModelDialogController: postUtil.confirmModelDialogController('community'),
            template: Ember.Handlebars.compile(authorTemplate),
            tagName: ''
        });
    });
