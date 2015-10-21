"use strict";

define(["app","services/registrationsService", "services/entitlementService"],
    function(app, registrationsService, entitlementService) {
        app.UserManagementRegistrationsRoute = Ember.Route.extend({

            queryParams: {
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
                },
                searchTextValue: {
                    refreshModel: true
                }
            },
            allowed: false,
            beforeModel: function (transition) {
                var self = this;
                var adminPermissionPromise = entitlementService.hasAnyPermission(["/userpi/ModerateRegistrations"]);
                return adminPermissionPromise.then(function (decision) {
                    self.allowed = decision;
                })
            },
            model: function (queryParams) {
                if (!this.allowed)
                    return {};
                var pageNumber = (queryParams.pageNumber && queryParams.pageNumber > 0) ? queryParams.pageNumber : 1;
                var searchTextValue = queryParams.searchTextValue && queryParams.searchTextValue.length > 0 ? queryParams.searchTextValue : "*";
                var sortBy = queryParams.sortBy ? queryParams.sortBy : "createdOn";
                var sortOrder = queryParams.sortOrder ? queryParams.sortOrder : "desc";

                return registrationsService.searchRegistrations(searchTextValue,app.PageSize,pageNumber,sortBy, sortOrder);
            },
            setupController: function(controller, model) {
                controller.set('errorMessage', '');
                controller.set('model', model);
                controller.set('is__userpi_ModerateRegistrations', this.allowed);
            }
        });
        return app;
    });
