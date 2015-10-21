"use strict";

define(["app", "httpClient", "text!templates/admin/createRoleModal.hbs", "services/roleService"],
  function (app, httpClient, createRoleModalTemplate, roleService) {

    app.RoleAddView = Ember.View.extend({
      template: Ember.Handlebars.compile(createRoleModalTemplate),
    });

    app.RoleAddController = Ember.ObjectController.extend({
      systemRoles: [],
      modalTitle: "Create Custom Role",
      modalSubtitle: "Add new role",
      modalNote: "*System roles have pre-defined permissions.",
      selectedRole: null,
      roleMessage: null,
      content: {
        name: "",
        description: ""
      },

      setSystemRoles: function () {
        var self = this
        var query = {"type": "SYSTEM"};
        roleService.getRoles(query).then(function (roles) {
          self.set("systemRoles", roles.roles);
        })
      },
      clearModel: function () {
        this.set("content", {name: "", description: ""});
        this.set("roleMessage", null)
        this.set("selectedRole", null)
        this.set("systemRoles", []);
      },

      actions: {

        showFileErrors: function (errorMessage) {
          if (errorMessage) {
            this.set('fileMessage', {'error': errorMessage});
          }
          this.set("errors", {file: null});
        },


        createRole: function () {

          var self = this;
          var roleMap = this.get("content");
          var permissions = [];
          if(self.selectedRole != null){
            permissions = self.selectedRole.permissions;
          }

          if(roleMap.name.trim() == ""){
            self.set('roleMessage', {'error': "Name cannot be blank."});
            return;
          }

          var role = {
            name: roleMap.name.trim(),
            description: roleMap.description.trim(),
            permissions: {add: permissions}
          }

          var failureCallBack = function (message) {
            if (message.status == 400) self.set('roleMessage', {'error': message.responseJSON.errors.join()})
            else self.set('roleMessage', {'error': "Error in creating role."});
          }

          var successCallBack = function () {
            self.set('roleMessage', {'success': "Role is created successfully."})
          }

          roleService.create(role).then(successCallBack).fail(failureCallBack);

        }

      }

    });
  });
