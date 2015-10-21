'use strict';

define(['app',
        'underscore',
        'text!templates/communities/communityDetailPlaybook.hbs','text!templates/communities/communityDetailPlaybook.hbs'],
    function(app, _, toBeDecommisioned, playbookTemplate) {
        app.CommunityPlaybookView = Ember.View.extend({
            template: Ember.Handlebars.compile(playbookTemplate)
        });
    });
