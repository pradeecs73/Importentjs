define(["underscore", 'app', 'Q', 'httpClient'], function (_, app, Q, httpClient) {
  var allAdminPermissions = [
    {
      "_id": "/ed/Expertise",
      "appId": applicationIdConfig.userpi
    },
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
    },
    {
      "_id": "/tenant/ViewLicenseBatches",
      "appId": applicationIdConfig.userpi
    },
    {
      "_id": "/userpi/ModerateRegistrations",
      "appId": applicationIdConfig.userpi
    },
    {
      "_id": "/tenant/SiteManagement",
      "appId": applicationIdConfig.userpi
    },
    {
      "_id": "/roles/RolesManagement",
      "appId": applicationIdConfig.userpi
    }
  ]
  var operationAdminPermissions = [
    {
      "_id": "/system/TriggerSync",
      "appId": applicationIdConfig.userpi
    }
  ]
  var adminPermissionForAUser = null;
  var operationAdminPermissionForAUser = null;

  var hasAnyPermission = function (permissions) {
    return !_.isEmpty(permissions)
  };
  return {
    isAdmin: function () {
      return this.hasPermissions(allAdminPermissions)
    },

    isOpsAdmin: function () {
      if(operationAdminPermissionForAUser != null)
        return Q(operationAdminPermissionForAUser);
      return httpClient.post("/knowledgecenter/authorization/management/permissions/_filter?applicationId=" + applicationIdConfig.userpi, {permissions: operationAdminPermissions}).then(function(response){
        operationAdminPermissionForAUser = _.isEqual(response.permissions , operationAdminPermissions)
        return operationAdminPermissionForAUser;
      });
    },

    hasRole: function (role) {
      return httpClient.get("/knowledgecenter/userpi/roles/" + role).then(function (response) {
        return response.hasRole
      }).fail(function (err) {
        return false;
      })
    },

    hasPermissions: function (permissions) {
      if (adminPermissionForAUser != null) {
        return Q(hasAnyPermission(adminPermissionForAUser));
      }
      return this.filterPermissions(permissions).then(function (response) {
        adminPermissionForAUser = response.permissions;
        return hasAnyPermission(adminPermissionForAUser)
      }).fail(function (err) {
        console.debug(err);
        return false;
      })
    },

    allowedAdminPermissions: function () {
      if (adminPermissionForAUser != null) {
        return Q(adminPermissionForAUser);
      }
      return this.filterPermissions(allAdminPermissions).then(function (response) {
        adminPermissionForAUser = response.permissions;
        return adminPermissionForAUser
      }).fail(function (err) {
        console.debug(err);
        return [];
      })
    },

    hasAnyPermission: function (subsetPermission) {
      var self = this;
      return this.allowedAdminPermissions().then(function (allowedPermissions) {
        var permissionIds = self.permissionIds(allowedPermissions);
        return _.intersection(permissionIds, subsetPermission).length > 0
      })
    },

    permissionIds: function (permissions) {
      return _.map(permissions, function (aPermissionObject) {
        return aPermissionObject._id;
      });
    },

    permissionsAsControllerProperty: function (permissions) {
      return _.map(this.permissionIds(permissions), function (aPermissionId) {
        var underscoreSeparatedId = _.reduce(aPermissionId.split("/"), function (accumulator, part) {
          return accumulator.concat("_").concat(part)
        }, "");
        return "is" + underscoreSeparatedId;
      });
    },

    filterPermissions: function (permissions) {
      return httpClient.post("/knowledgecenter/authorization/management/permissions/_filter?applicationId=" + applicationIdConfig.userpi, {permissions: permissions});
    },
    allowedReportAdminPermissions: function () {
      var adminPermissionForAUser = null;
      var allReportAdminPermissions = [
        {
          "_id": "/report/ReportManagement",
          "appId": applicationIdConfig.userpi
        },
        {
          "_id": "viewAdminReports",
          "appId": applicationIdConfig.userpi
        }
      ]
      if (adminPermissionForAUser != null) {
        return Q(adminPermissionForAUser);
      }
      return this.filterPermissions(allReportAdminPermissions).then(function (response) {
        adminPermissionForAUser = response.permissions;
        return adminPermissionForAUser
      }).fail(function (err) {
        console.debug(err);
        return [];
      })
    },
    hasReportAnyPermission: function (subsetPermission) {
      var self = this;
      return this.allowedReportAdminPermissions().then(function (allowedPermissions) {
        var permissionIds = self.permissionIds(allowedPermissions);
        return _.intersection(permissionIds, subsetPermission).length > 0
      })
    }
  }
});
