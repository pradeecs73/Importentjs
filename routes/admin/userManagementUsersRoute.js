"use strict";

define(["app", "services/usersService", 'underscore', 'services/entitlementService', 'Q' ],
  function(app, usersService, _, entitlementService, Q) {
    app.UserManagementUsersRoute = Ember.Route.extend({
      queryParams: {
        searchText: {
          refreshModel: true
        },
        filters: {
          refreshModel: true
        },
        pageNumber: {
            refreshModel: true
        },
        sortBy: {
          refreshModel: true
        },
        sortOrder: {
          refreshModel: true
        }

      },

      renderTemplate: function() {
        this.render()
        var model = this.modelFor('adminUsers')
        if (model && model.length == 0) {
          this.render("noData")
        }
      },

      addUserStatusFilter: function (filters) {
        _.each(filters, function (filter) {
          var filterKey = filter.split(":")[0];
          var filterValue = filter.split(":")[1];
          if (filterKey === "status" && filterValue === "Active") {
            filters.push("active:true");
            filters.splice(filters.indexOf("status:Active"), 1);
          } else if (filterKey === "status" && filterValue === "InActive") {
            filters.push("active:false")
            filters.splice(filters.indexOf("status:InActive"), 1);
          }
        })
      },

      model: function (queryParams) {
        var filters = queryParams.filters ? queryParams.filters.split(";") : [];
        this.addUserStatusFilter(filters);
        var searchText = queryParams.searchText && queryParams.searchText.length > 0 ? queryParams.searchText : "*";
        var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0) ? queryParams.pageNumber : 1;
        var sortBy = queryParams.sortBy ? queryParams.sortBy : (searchText != "*" ? "relevance" : "shortName");
        var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : 'asc';

        var hasAllPermissionPromise = entitlementService.hasAnyPermission(["/ed/AdminExpertiseAssignment", "/userpi/RoleAssignment", "/userpi/IdentityManagement"]);
        var allUsersWithFiltersPromise = usersService.allUsersWithFilters(searchText, filters, true, pageNumber, false, sortBy, sortOrder);
        return Q.all([hasAllPermissionPromise, allUsersWithFiltersPromise]).spread(function(hasPermission, userResults){
            userResults.allUsers = _.map(userResults.allUsers, usersService.transformUserProfile);
            userResults.userRelatedPermissions = hasPermission;
            return userResults;
        });
      },
      addUserStatusFacet: function (allFacets) {
        allFacets.status = [];
        _.each(allFacets.active, function (activeFacet) {
            if (activeFacet === "true")
                allFacets.status.push("Active");
            else
              allFacets.status.push("InActive");
          })
        delete allFacets["active"];
        return allFacets;
      },
      setupController : function(controller, model) {
        var allRolesPromise = usersService.allRoles();
        var adminPermissionPromise = entitlementService.allowedAdminPermissions();
        var self = this;
        Q.all([allRolesPromise, adminPermissionPromise]).spread(function (allRoles, permissions) {
            controller.set('roles', allRoles);
            controller.set('model', model.allUsers);
            var allFacets = self.addUserStatusFacet(model.allFacets);
            controller.set('allFacets', model.allFacets);
            controller.set('totalResults', model.totalResults);
            controller.set('userRelatedPermissions', model.userRelatedPermissions);
            var permissionIds = entitlementService.permissionsAsControllerProperty(permissions);
            _.each(permissionIds, function (aPermission) {
              controller.set(aPermission, true);
            })
        })
      },
      reset: function() {
        var self = this;
        var controller = this.controllerFor('adminUsers');
        this.model({}).then(function(model) {
          self.setupController(controller, model);
        })
      },
      actions: {
        uploadUsersModal: function() {
          var controller = this.controllerFor("adminUploadUsers");
          this.render("adminUploadUsers", {
            into: "application",
            outlet: "modal",
            controller: controller
          });
        },

        seedUsersModal : function() {
          var controller = this.controllerFor("seedUsers");
          this.render("seedUsers", {
            into: "application",
            outlet: "modal",
            controller: controller
          });
        },

        close: function() {
          this.disconnectOutlet({outlet: 'modal', parentView: 'application'});
          this.controllerFor("adminUploadUsers").reset();
          this.controllerFor("seedUsers").reset();
          this.refresh();
        },
        filter: function(filters) {
          this.controller.set('filters', filters.join(';'));
        },
        search: function() {
          this.controller.set('searchText', this.controller.get('searchBoxText'))
        }
      }
    });

    return app;
  });
