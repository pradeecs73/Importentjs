"use strict";

define(["app", "text!templates/adminModel.hbs", "services/topicModellingService"],
    function (app, adminModelTemplate, topicModellingService) {
        App.AdminModelView = Ember.View.extend({
            template: Ember.Handlebars.compile(adminModelTemplate)
        });

        App.AdminModelRoute = Ember.Route.extend({
            model: function () {
                return topicModellingService.documentsToModel();
            }
        });

        App.AdminModelController = Ember.ObjectController.extend({

            modellingResponse: function () {
                return this.get("_modellingResponse");
            }.property("_modellingResponse"),

            isModellingSuccessful: function () {
                var resp = this.get("_modellingResponse");
                return resp && resp.status === "SUCCESS";
            }.property("_modellingResponse"),

            documentsToModel: function () {
                return this.get("model").length;
            }.property("model"),

            reloadModel: function () {
                return topicModellingService.documentsToModel();
            },

            notifyUser: function (status, message) {
                this.set("_modellingResponse", {
                    message: message,
                    status: status
                });
            },

            actions: {
                reload: function () {
                    var self = this;
                    this.reloadModel().then(function (response) {
                        self.set("model", response);
                    });
                },

                modelDocuments: function () {
                    var documentIds = this.get("model");
                    if (documentIds.length === 0) {
                        this.notifyUser("FAILED", "No documents for modelling.");
                        return;
                    }

                    var self = this;
                    topicModellingService.modelDocuments(documentIds)
                        .then(function () {
                            return self.reloadModel();
                        })
                        .then(function (response) {
                            self.set("model", response);
                            self.notifyUser("SUCCESS", "Documents have been submitted for modelling.");
                        }).fail(function () {
                            self.notifyUser("FAILED", "Failed to submit documents for modelling, please try again later.");
                        }
                    )
                }
            }
        });
    });
