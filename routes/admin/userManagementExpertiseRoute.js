"use strict";

define(["app","services/expertiseService","services/entitlementService", 'underscore','emberValidator'],
  function(app, expertiseService,entitlementService, _) {

    app.UserManagementExpertiseRoute = Ember.Route.extend({
      queryParams: {
        pageNumber: {
          refreshModel: true
        },
        searchtextvalue: {
          refreshModel: true
        }
      },
      model: function(queryParams) {
        var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0) ? queryParams.pageNumber : 1;
        var searchtextvalue = queryParams.searchtextvalue && queryParams.searchtextvalue.length > 0 ? queryParams.searchtextvalue : "*";
        return expertiseService.searchExpertise(searchtextvalue,null,app.PageSize,pageNumber);
      },
      setupController: function(controller, model) {
        controller.set('errorMessage', '');
        controller.set('successMessage', '');
        controller.set('model', model);
        var adminPermissionPromise = entitlementService.allowedAdminPermissions();
        adminPermissionPromise.then(function(permissions){
          var permissionIds = entitlementService.permissionsAsControllerProperty(permissions);
          _.each(permissionIds, function(aPermission){
            controller.set(aPermission, true);
          })
        })
      },
      actions: {
        uploadExpertiseModal: function() {
          var controller = this.controllerFor("adminUploadExpertise");
          this.render("adminUploadExpertise", {
            into: "application",
            outlet: "modal",
            controller: controller
          });
        },
        close: function() {
          this.disconnectOutlet({outlet: 'modal', parentView: 'application'});
          this.controllerFor("adminUploadExpertise").reset();
          this.refresh();
        }
      }
    });

    return app;
  });
