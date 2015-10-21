'use strict';

define(['app', "text!templates/admin/system.hbs","services/admin/adminHelper"], function (app, adminSystemTemplate,adminHelper) {

  App.SystemView = Ember.View.extend({
    template: Ember.Handlebars.compile(adminSystemTemplate)
  });

  App.SystemRoute = Ember.Route.extend({
    model: function () {
      var systemTabPermissions = adminHelper.adminPermissionModel.systemActions;
      return adminHelper.filterPermissions(systemTabPermissions).then(function (permissions) {
        return {
          showErrorTab: _.isEmpty(permissions),
          licenceTabEnabled: adminHelper.showLicenceTab(permissions),
          preferenceTabEnabled: adminHelper.showPreferenceTab(permissions)
        }
      })
    }
  });

  App.SystemIndexRoute = Ember.Route.extend({
    redirect: function () {
      var routerMap = {
        licenceTabEnabled: "system.licenseBatch",
        preferenceTabEnabled: "system.preferences",
      }
      var tabsEnabled = _.omit(this.modelFor("system"), "showErrorTab");
      var defaultTab = _.first(_.filter(_.keys(tabsEnabled), function (tabName) {
        return tabsEnabled[tabName]
      }))

      if (!this.modelFor("system").showErrorTab) this.transitionTo(routerMap[defaultTab]);
    }
  });

});
