'use strict';

define(['app', "text!templates/admin/mobile.hbs","services/admin/adminHelper"], function (app, mobileTemplate,adminHelper) {

  App.MobileView = Ember.View.extend({
    template: Ember.Handlebars.compile(mobileTemplate)
  });

  App.MobileIndexRoute = Ember.Route.extend({
    redirect: function () {
      this.transitionTo("mobile.mobileFolder");
    }
  });

});
