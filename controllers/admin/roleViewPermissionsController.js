"use strict";

define(["app", "httpClient", "text!templates/admin/viewRolePermissionsModal.hbs", "services/roleService"],
  function (app, httpClient, viewRolePermissionsModalTemplate, roleService) {

    app.RoleViewPermissionsView = Ember.View.extend({
      template: Ember.Handlebars.compile(viewRolePermissionsModalTemplate),
    });

    app.RoleViewPermissionsController = Ember.ObjectController.extend({
      modalTitle: "Permissions",

      modalSubTitle : function(){
		if(this.content.name == "Instructor"){
			return "Please work with Catalog Administrator to assign the role in LMS";
		}else{
			return "View Permissions for " + this.content.name;
		}
      }.property('this.content.name'),

      setModel: function (role) {
        this.set("model", role);
      },

      clearModel: function () {
        this.set("content", {name: ""});
      }

    })
  });
