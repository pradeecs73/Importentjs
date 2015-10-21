'use strict';

define(['app', "text!templates/admin/collaborate.hbs","services/admin/adminHelper"], function (app, collaborateTemplate,adminHelper) {

  App.CollaborateView = Ember.View.extend({
    template: Ember.Handlebars.compile(collaborateTemplate)
  });

  App.CollaborateIndexRoute = Ember.Route.extend({
    redirect: function () {
     this.transitionTo("collaborate.categories");
    }
  });

});
