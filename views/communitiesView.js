'use strict';

define(['app',
    'underscore',
    'text!templates/communities.hbs'],
  function(app, _, communitiesTemplate) {
    app.CommunitiesView = Ember.View.extend({
      template: Ember.Handlebars.compile(communitiesTemplate)
    });
  });
