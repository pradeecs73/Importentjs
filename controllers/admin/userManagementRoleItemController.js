"use strict";


define(["app", 'underscore', "services/roleService"], function (app, _, roleService) {

  app.AdminRoleItemController = Ember.ObjectController.extend({

    isActive: function () {
      return this.content.status === "Active";
    }.property(),

    isSystemRole: function () {
      return this.content.type === "SYSTEM";
    }.property(),

    actions: {

      activateRole: function () {
        var self = this;
        var role = this.content;
        role.permissions = {add: role.permissions}
        roleService.activateRole(role).then(function () {
          self.send("closeRoleModal");
        });
      },

      deleteRole: function () {
        var self = this;
        var role = {name: this.content.name, _id: this.content._id}
        roleService.deleteRole(role).then(function () {
          self.send("closeRoleModal");
        });
      },



    }
  })

})