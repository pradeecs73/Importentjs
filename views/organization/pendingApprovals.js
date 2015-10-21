'use strict'

define(['app', 'text!templates/organization/pendingApprovals.hbs'], function(app, pendingApprovals) {
    app.PendingApprovalsView = Ember.View.extend({
        template: Ember.Handlebars.compile(pendingApprovals),
    });
})