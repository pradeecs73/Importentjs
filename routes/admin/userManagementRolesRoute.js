"use strict";

define(["app", 'httpClient', "services/roleService", "services/entitlementService"],
  function (app, httpClient, roleService, entitlementService) {
    app.UserManagementRolesRoute = Ember.Route.extend({
      queryParams: {
        pageNumber: {
          refreshModel: true
        },
        sortOrder: {
          refreshModel: true
        },
        sortField: {
          refreshModel: true
        },
        searchText: {
          refreshModel: true
        },
        filters: {
          refreshModel: true
        }
      },
      model: function (queryParams) {
        var filters = queryParams.filters ? queryParams.filters.split(";") : [];
        var query = {
          paginate: true,
          pageNumber: queryParams.pageNumber,
          pageSize: app.PageSize,
          sortField: queryParams.sortField ? queryParams.sortField : "createdOn",
          sortOrder: queryParams.sortOrder ? queryParams.sortOrder : 'asc',
          filters: filters
        }
        return roleService.getRoles(query, filters).then(function (response) {
          return response;
        }, function(error){
          return {};
        });
      },

      setupController: function (controller, model) {
        controller.set('errorMessage', '');
        controller.set('filter', '');
        controller.set('model', model);
        controller.set('allFacets', model.allFacets);
        var adminPermissionPromise = entitlementService.allowedAdminPermissions();
        adminPermissionPromise.then(function(permissions){
          var permissionIds = entitlementService.permissionsAsControllerProperty(permissions);
          _.each(permissionIds, function(aPermission){
            controller.set(aPermission, true);
          })
        })
      },

      actions: {
        createRoleModal: function () {
          var self = this;
          var controller = this.controllerFor("roleAdd");
          controller.clearModel()
          controller.setSystemRoles();
          self.render("roleAdd", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        }
        ,

        createViewPermissionModal: function (role) {
          var self = this;
          var controller = this.controllerFor("roleViewPermissions")
          controller.clearModel();
          controller.setModel(role);
          self.render("roleViewPermissions", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        }
        ,

        deleteRoleModal: function (role) {
          var controller = this.controllerFor("confirmation")
          controller.set('model', {entity: role});
          controller.set('parentController', this);
          controller.set('title', "Delete Roles");
          controller.set('message', "Are you sure you want to delete the selected role?");
          controller.set('onConfirm', 'deleteRole')
          controller.set('onClose', 'closeConfirmationModal')
          this.render("confirmation", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        } ,

        deActivateRoleModal: function (role) {
          var controller = this.controllerFor("confirmation")
          controller.set('model', {entity:  role});
          controller.set('parentController', this);
          controller.set('title', "Deactivate Roles");
          controller.set('message', "Are you sure you want to deactivate the selected role?");
          controller.set('onConfirm', 'inactivateRole')
          controller.set('onClose', 'closeConfirmationModal')
          this.render("confirmation", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        } ,

        deleteRole: function (role) {
          var self = this;
          function flashMessage(messageDiv) {
            messageDiv.fadeIn('slow');
            setTimeout(function() {
              messageDiv.fadeOut('slow');
            }, 3000);
          };
          roleService.deleteRole(role).then(function () {
            self.send('closeConfirmationModal');
            self.refresh().then(function(res) {
            var messageDiv = $("#messageDiv");
            messageDiv.removeClass("alert-danger");
            messageDiv.addClass("alert-success");
            messageDiv.children("p").html("Selected Role has been deleted successfully.")
            flashMessage(messageDiv);
          });
          }, function(error) {
            self.send("closeDeleteConfirmationModal");
            var messageDiv = $("#messageDiv");
            messageDiv.removeClass("alert-success");
            messageDiv.addClass("alert-danger");
            messageDiv.children("p").html("Selected Role deletion failed. Please try again later.")
            flashMessage(messageDiv);
          });
        },

        inactivateRole: function (role) {
          var self = this;
          function flashMessage(messageDiv) {
            messageDiv.fadeIn('slow');
            setTimeout(function() {
              messageDiv.fadeOut('slow');
            }, 3000);
          };
          roleService.deactivateRole(role).then(function () {
            self.send('closeConfirmationModal');
            self.refresh().then(function(res) {
              var messageDiv = $("#messageDiv");
              messageDiv.removeClass("alert-danger");
              messageDiv.addClass("alert-success");
              messageDiv.children("p").html("Selected role has been deactivated successfully.")
              flashMessage(messageDiv);
            });
          }, function(error) {
            self.send("closeConfirmationModal");
            var messageDiv = $("#messageDiv");
            messageDiv.removeClass("alert-success");
            messageDiv.addClass("alert-danger");
            messageDiv.children("p").html("Selected role inactivation failed. Please try again later.")
            flashMessage(messageDiv);
          });
        },

        closeConfirmationModal: function() {
          this.disconnectOutlet({
            outlet: 'modal',
            parentView: 'application'
          });
        },

        createEditPermissionModal: function (role) {
          var self = this;
          var controller = this.controllerFor("roleEditPermissions")
          this.transitionTo("role.editPermissions")
          controller.clearModel();
          controller.setModel(role);
          self.render("roleEditPermissions", {
            into: 'application',
            outlet: 'modal',
            controller: controller
          });
        },


        setRoleIdToDelete: function(role) {
          this.controller.roleIdToDelete = role._id;
        },

        closeRoleModal: function () {
          this.refresh();
        },

        filter: function (filters) {
          this.controller.set('filters', filters.join(';'));
        }
      },
    })
    return app;
  })
;