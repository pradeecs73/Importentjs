"use strict";

define(["app", "text!templates/preferences.hbs", "services/configurationsService", 'httpClient', "services/entitlementService"],
    function (app, adminPreferencesTemplate, configurationsService, httpClient, entitlementService) {

        App.SystemPreferencesController = Ember.ObjectController.extend({
            toggleablePreferences: ["AutoApproveUserRegistration"],
            populateShortNames: function () {
                var allConfigurations = this.get('model').allConfigurations;
                var self = this;

                _.forEach(allConfigurations, function (configuration) {
                    if(self.toggleablePreferences.contains(configuration.name))
                        Ember.set(configuration, "editable", configuration.canEdit)
                    else
                        Ember.set(configuration, "editable", (configuration.canEdit) && (configuration.value != "true"))
                    var status = configuration.value == "true" ? "On" : "Off";
                    Ember.set(configuration, "status", status)
                    Ember.set(configuration, "checked", status === "On")
                })
            }.observes('model.allConfigurations')
        });

        App.SystemPreferencesRoute = Ember.Route.extend({
            model: function (queryParams) {
                return configurationsService.fetchTenantPreferences();
            },
            setupController: function (controller, model) {
                //controller.set('errorMessage', 'Error Message Not ');
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
                confirmEnable: function (preference) {
                    var controller = this.controllerFor("confirmation")
                    controller.set('model', {entity: preference});
                    controller.set('parentController', this);
                    controller.set('title', "Enable Feature");
                    if(this.controller.get('toggleablePreferences').contains(preference.name))
                        controller.set('message', "Are you sure you want to enable "+ preference.name +"?");
                    else
                        controller.set('message', "Are you sure you want to enable "+ preference.name +"? Once enabled, you will not be able to switch it off");
                    controller.set('onConfirm', 'turnOnPreference')
                    controller.set('onClose', 'closeConfirmationModal')
                    this.render("confirmation", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                confirmDisable: function (preference) {
                    var controller = this.controllerFor("confirmation")
                    controller.set('model', {entity: preference});
                    controller.set('parentController', this);
                    controller.set('title', "Disable Feature");
                    controller.set('message', "Are you sure you want to disable "+ preference.name +"?");
                    controller.set('onConfirm', 'turnOffPreference')
                    controller.set('onClose', 'closeConfirmationModal')
                    this.render("confirmation", {
                        into: 'application',
                        outlet: 'modal',
                        controller: controller
                    });
                },

                turnOnPreference: function (preference) {
                    var self = this;
                    function flashMessage(messageDiv) {
                        messageDiv.fadeIn('slow');
                        setTimeout(function() {
                            messageDiv.fadeOut('slow');
                        }, 3000);
                    };

                    httpClient.post("/knowledgecenter/tenantmanagement/preferences/"+ preference.name, {"value": "true", "allowOverride": preference.allowOverride}).then(function(response) {
                        self.send('closeConfirmationModal');
                        self.refresh().then(function(res) {
                            var messageDiv = $("#messageDiv");
                            messageDiv.removeClass("alert-danger");
                            messageDiv.addClass("alert-success");
                            messageDiv.children("p").html("Feature has been enabled successfully.")
                            flashMessage(messageDiv);
                        });
                    }).fail(function(err){
                        self.send("closeConfirmationModal");
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-success");
                        messageDiv.addClass("alert-danger");
                        messageDiv.children("p").html("Feature enabling failed. Please try again later.")
                        flashMessage(messageDiv);
                    });
                },

                turnOffPreference: function (preference) {
                    var self = this;
                    function flashMessage(messageDiv) {
                        messageDiv.fadeIn('slow');
                        setTimeout(function() {
                            messageDiv.fadeOut('slow');
                        }, 3000);
                    };

                    httpClient.post("/knowledgecenter/tenantmanagement/preferences/"+ preference.name, {"value": "false", "allowOverride": preference.allowOverride}).then(function(response) {
                        self.send('closeConfirmationModal');
                        self.refresh().then(function(res) {
                            var messageDiv = $("#messageDiv");
                            messageDiv.removeClass("alert-danger");
                            messageDiv.addClass("alert-success");
                            messageDiv.children("p").html("Feature has been disabled successfully.")
                            flashMessage(messageDiv);
                        });
                    }).fail(function(err){
                        self.send("closeConfirmationModal");
                        var messageDiv = $("#messageDiv");
                        messageDiv.removeClass("alert-success");
                        messageDiv.addClass("alert-danger");
                        messageDiv.children("p").html("Feature disabling failed. Please try again later.")
                        flashMessage(messageDiv);
                    });
                },
                closeConfirmationModal: function() {
                    this.disconnectOutlet({
                        outlet: 'modal',
                        parentView: 'application'
                    });
                }
            }
        });

        App.SystemPreferencesView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminPreferencesTemplate)
        });

    });