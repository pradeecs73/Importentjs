"use strict";

define(["app", "httpClient", "text!templates/admin/editRolePermissionsModal.hbs", "services/permissionService", "services/roleService"],
  function (app, httpClient, editRolePermissionsModalTemplate, permissionService, roleService) {

    app.RoleEditPermissionsView = Ember.View.extend({
      template: Ember.Handlebars.compile(editRolePermissionsModalTemplate)
    });

    app.RoleEditPermissionsController = Ember.ObjectController.extend({
      modalTitle: "Set Permissions",
      existingPermissions: [],
      updatedPermissions: [],
      filters: "",

      modalFilterTitle: "To filter permissions by component type the name(s) of the component(s) on the field.",

      modalSubTitle: function () {
        if (this.content.role != null)
          return "Set Permissions for " + this.content.role.name;
        else
          return ""
      }.property('this.content.name'),

      addPermission: function (permission) {
        this.updatedPermissions.push(permission)
      },

      removePermission: function (permission) {
        this.updatedPermissions.removeObject(permission)
      },

      handlePermissionChange: function (permission, isChecked) {
        isChecked ? this.addPermission(permission) : this.removePermission(permission);
      },

      updateModel: function (filters) {
        var filteredPermissions
        if (_.isEmpty(filters)) {
          filteredPermissions = this.content.permissions
        }
        else {
          filteredPermissions = _.filter(this.content.permissions, function (permission) {
            return _.contains(filters, permission.type);
          });
        }
        this.set("model.filteredPermission", filteredPermissions);
        this.set("model.filteredFacets", {
          type: _.filter(this.content.allFacets.type, function (typeVal) {
            return !_.contains(filters, typeVal);
          })
        })
      },

      setModel: function (role) {
        var self = this;
        var model = {role: role}
        var rolePermissionsNames = _.map(role.permissions, function (permission) {
          return permission.name;
        });
        this.existingPermissions = _.extend([], rolePermissionsNames);
        this.updatedPermissions = _.extend([], rolePermissionsNames);
        permissionService.getPermissions().then(function (permissions) {
          var permissionChecked = _.map(permissions.permissions, function (permission) {
            permission["isChecked"] = _.contains(rolePermissionsNames, permission.name)
            return permission;
          });
          model.filteredPermission = permissionChecked
          model.permissions = permissionChecked;
          model.allFacets = _.extend(permissions.allFacets, {});
          model.filteredFacets = _.extend(permissions.allFacets, {});
          self.set("model", model);
        })
      },

      clearModel: function () {
        this.set("model", {});
        this.set("existingPermissions", []);
        this.set("updatedPermissions", []);
        this.set("filters", "");
        this.set("content", {name: ""});
      },

      actions: {
        setPermissions: function () {
          var self = this;
          var removePermissions = _.difference(this.existingPermissions, this.updatedPermissions);
          var addPermissions = _.difference(this.updatedPermissions, this.existingPermissions);

          var permissionsObject = {
            add: _.filter(this.content.permissions, function (permission) {
              return _.contains(addPermissions, permission.name);
            }),
            remove: _.filter(this.content.permissions, function (permission) {
              return _.contains(removePermissions, permission.name);
            })
          };
          var role = this.content.role;
          role.permissions = permissionsObject;
          roleService.updatePermissions(role).then(function () {
            self.send("closeRoleModal");

          })
        },

        filter: function (filters) {
          this.set('filters', filters.join(';'));
          var filterStrings = _.map(filters, function (filter) {
            return filter.split(":")[1];
          });

          this.updateModel(filterStrings);
        }
      }

    })
  });
