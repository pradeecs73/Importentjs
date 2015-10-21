"use strict";

define(["app", "httpClient", "text!templates/admin/deleteRoleModal.hbs", "services/roleService"],
function (app, httpClient, deleteRoleModalTemplate, roleService) {

app.DeleteRoleView = Ember.View.extend({
template: Ember.Handlebars.compile(deleteRoleModalTemplate),
});

app.DeleteRoleController = Ember.ObjectController.extend({
modalTitle: "Delete Role",

modalSubTitle : function(){
return "View Permissions for " + this.content.name;

}.property('this.content.name'),

setModel: function (role) {
this.set("model", role);
},

clearModel: function () {
this.set("content", {name: ""});
},
  deleteRole: function () {
    var self = this;
    var role = {name: this.content.name, _id: this.content._id}
    roleService.deleteRole(role).then(function () {
      self.send("closeRoleModal");
    });
  }

})
});
