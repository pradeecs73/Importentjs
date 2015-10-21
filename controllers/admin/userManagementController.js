'use strict';

define(['app', "text!templates/admin/userManagement.hbs", "services/admin/adminHelper"], function (app, userTemplate, adminHelper) {

  App.UserManagementView = Ember.View.extend({
    template: Ember.Handlebars.compile(userTemplate)
  });

  App.UserManagementRoute = Ember.Route.extend({
    model: function () {
      var userTabPermissions = adminHelper.adminPermissionModel.userActions;
      return adminHelper.filterPermissions(userTabPermissions).then(function (permissions) {
        return {
          showErrorTab: _.isEmpty(permissions),
          userTabEnabled: adminHelper.showUsersTab(permissions),
          registrationTabEnabled: adminHelper.showRegistrationTab(permissions),
          rolesTabEnabled: adminHelper.showRolesTab(permissions),
          expertiseTabEnabled: adminHelper.showExpertiseTab(permissions)
        }
      })
    }
  });


  App.UserManagementIndexRoute = Ember.Route.extend({

    redirect: function () {
      var routerMap = {
        userTabEnabled: "userManagement.users",
        registrationTabEnabled: "userManagement.registrations",
        rolesTabEnabled: "userManagement.roles",
        expertiseTabEnabled: "userManagement.expertise"
      }
      var tabsMapping = _.omit(this.modelFor("userManagement"), "showErrorTab");
      var defaultTab = _.first(_.filter(_.keys(tabsMapping), function (tabName) {
        return tabsMapping[tabName]
      }))

      if (!this.modelFor("userManagement").showErrorTab) this.transitionTo(routerMap[defaultTab])
    }
  });

});

