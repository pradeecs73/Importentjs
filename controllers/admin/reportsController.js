'use strict';

define(['app', "text!templates/admin/reports.hbs", "services/admin/adminHelper"], function (app, adminReportsTemplate, adminHelper) {

  App.ReportsView = Ember.View.extend({
    template: Ember.Handlebars.compile(adminReportsTemplate)
  });


  App.ReportsRoute = Ember.Route.extend({
    model: function () {
      var reportsTabPermissions = adminHelper.adminPermissionModel.reportActions;
      return adminHelper.filterPermissions(reportsTabPermissions).then(function (permissions) {
        return {
          showErrorTab: _.isEmpty(permissions),
          usageTabEnabled: adminHelper.showUsageTab(permissions),
          formalLearningTabEnabled: adminHelper.showFormalLearningTab(permissions),
        }
      })
    }
  });


  App.ReportsIndexRoute = Ember.Route.extend({
    redirect: function () {
      var routerMap = {
        usageTabEnabled: "reports.usage",
        formalLearningTabEnabled: "reports.enrollment"
      }
      var tabsEnabled = _.omit(this.modelFor("reports"), "showErrorTab");
      var defaultTab = _.first(_.filter(_.keys(tabsEnabled), function (tabName) {
        return tabsEnabled[tabName]
      }))
      if (!this.modelFor("reports").showErrorTab) this.transitionTo(routerMap[defaultTab]);
    }
  });

});
