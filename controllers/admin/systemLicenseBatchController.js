"use strict";

define(["app", "text!templates/licenseBatch.hbs","services/licenseBatchService","services/entitlementService"],
    function (app, adminLicenseBatchTemplate,licenseBatchService, entitlementService) {

        App.SystemLicenseBatchController = Ember.ArrayController.extend({

        });

        App.SystemLicenseBatchRoute = Ember.Route.extend({
            model: function (queryParams) {
                return licenseBatchService.fetchTenantLicenseBatches();
            },
            setupController: function (controller, model) {
                controller.set('errorMessage', 'Error Message Not ');
                controller.set('model', model);
                var adminPermissionPromise = entitlementService.allowedAdminPermissions();
                adminPermissionPromise.then(function(permissions){
                    var permissionIds = entitlementService.permissionsAsControllerProperty(permissions);
                    _.each(permissionIds, function(aPermission){
                        controller.set(aPermission, true);
                    })
                })
            }
        });

        App.SystemLicenseBatchView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminLicenseBatchTemplate)
        });

    });