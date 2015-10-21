'use strict';

define(['app', 'text!templates/communities/communityDetailDocuments.hbs'],
    function (app, communityTemplate) {

        App.CommunityDocumentsView = Ember.View.extend({
            template: Ember.Handlebars.compile(communityTemplate)
        });
});