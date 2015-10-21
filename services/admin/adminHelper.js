define(['httpClient', 'underscore', 'services/entitlementService'], function (httpClient, _, entitlementService) {
  var adminPermissionModel = {
    userActions: {
      usersTab: [
        {
          "_id": "/ed/AdminExpertiseAssignment",
          "appId": applicationIdConfig.userpi
        },
        {
          "_id": "/userpi/RoleAssignment",
          "appId": applicationIdConfig.userpi
        },
        {
          "_id": "/userpi/IdentityManagement",
          "appId": applicationIdConfig.userpi
        }
      ],

      registrationsTab: [
        {
          "_id": "/userpi/ModerateRegistrations",
          "appId": applicationIdConfig.userpi
        }
      ],

      expertiseTab: [
        {
          "_id": "/ed/Expertise",
          "appId": applicationIdConfig.userpi
        }
      ],

      rolesTab: [
        {
          "_id": "/roles/RolesManagement",
          "appId": applicationIdConfig.userpi
        }
      ]
    },
    systemActions: {
      licensingTab: [
        {
          "_id": "/tenant/ViewLicenseBatches",
          "appId": applicationIdConfig.userpi
        }
      ],

      siteManagementTab: [
        {
          "_id": "/tenant/SiteManagement",
          "appId": applicationIdConfig.userpi
        }
      ]
    },

    mobileActions: {
      mobileFolderTab: []
    },

    collaborateActions: {
      blogProxyAssignmentTab: [],

      categories: []
    },

    reportActions: {
      reportsTab: [
        {
          "_id": "/report/ReportManagement",
          "appId": applicationIdConfig.userpi
        }],

      formalLearningTab: [{
        "_id": "viewAdminReports",
        "appId": applicationIdConfig.userpi
      }]
    }
  }

  return {
    adminPermissionModel: adminPermissionModel,

    isAdmin: function (permissions) {
      /** Empty means he has no permissions **/
      return !_.isEmpty(permissions)
    },

    contains: function (list, value) {
      return !_.isEmpty(_.filter(list, function (listValue) {
        return _.isEqual(listValue, value);
      }))
    },

    isSubList: function (list, subList) {
      var self = this;
      return !_.isEmpty(_.filter(list, function (listValue) {
        return self.contains(subList, listValue);
      }));
    },


    allowedActions: function(permissions, permissionOnActions){
      var actionsPermissions = this.flattenedPermissions(permissionOnActions);
      return this.isSubList(permissions, actionsPermissions);
    },


    showUserActions: function (permissions) {
      var userActionsPermissions = this.flattenedPermissions(adminPermissionModel.userActions);
      return this.isSubList(permissions, userActionsPermissions);
    },

    showSystemActions: function (permissions) {
      var systemActionsPermissions = this.flattenedPermissions(adminPermissionModel.systemActions);
      return this.isSubList(permissions, systemActionsPermissions);
    },

    showMobileActions: function (permissions) {
      var mobileActionsPermissions = this.flattenedPermissions(adminPermissionModel.mobileActions);
      return this.isSubList(permissions, mobileActionsPermissions);
    },

    showCollaborateActions: function (permissions) {
      var collaborateActionsPermissions = this.flattenedPermissions(adminPermissionModel.collaborateActions);
      return this.isSubList(permissions, collaborateActionsPermissions);
    },

    showReportsActions: function (permissions) {
      var reportActionsPermissions = this.flattenedPermissions(adminPermissionModel.reportActions);
      return this.isSubList(permissions, reportActionsPermissions);
    },

    showUsersTab: function (permissions) {
      var usersTabPermissions = adminPermissionModel.userActions.usersTab;
      return this.isSubList(permissions, usersTabPermissions);
    },

    showRolesTab: function (permissions) {
      var rolesTabPermissions = adminPermissionModel.userActions.rolesTab;
      return this.isSubList(permissions, rolesTabPermissions);
    },

    showExpertiseTab: function (permissions) {
      var expertiseTabPermissions = adminPermissionModel.userActions.expertiseTab;
      return this.isSubList(permissions, expertiseTabPermissions);
    },

    showRegistrationTab: function (permissions) {
      var registrationTabPermissions = adminPermissionModel.userActions.registrationsTab;
      return this.isSubList(permissions, registrationTabPermissions);
    },

    showLicenceTab: function (permissions) {
      var licenseTabPermission = adminPermissionModel.systemActions.licensingTab;
      return this.isSubList(permissions, licenseTabPermission);
    },

    showPreferenceTab: function (permissions) {
      var siteManagementTabPermission = adminPermissionModel.systemActions.siteManagementTab;
      return this.isSubList(permissions, siteManagementTabPermission);
    },

    showUsageTab: function (permissions) {
      var reportsTabPermission = adminPermissionModel.reportActions.reportsTab;
      return this.isSubList(permissions, reportsTabPermission);
    },

    showFormalLearningTab: function (permissions) {
      var formalLearningTab = adminPermissionModel.reportActions.formalLearningTab;
      return this.isSubList(permissions, formalLearningTab);
    },

    flattenedPermissions: function (permissions) {
      return _.chain(permissions)
        .values()
        .map(function (tab) {
          return _.values(tab);
        })
        .flatten()
        .value();
    },

    filterPermissions: function (permissions) {
      return entitlementService.filterPermissions(this.flattenedPermissions(permissions)).then(function (response) {
        return response.permissions;
      }).fail(function (err) {
        return [];
      })
    }
  }

});