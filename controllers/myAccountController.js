'use strict';
define(['app', 'text!templates/myAccount.hbs', 'services/usersService', 'jabberService', 'services/webExService', 'services/tenantService'],
	function(app, myAccountTemplate, usersService, jabberService, webExService, tenantService) {
		app.MyAccountRoute = Ember.Route.extend({
            model: function() {
                return usersService.getSession();
            },
            setupController: function(controller, model) {
                controller.resetFields();
                controller.set('model', model);
            }
		});

		app.MyAccountView = Ember.View.extend({
			template: Ember.Handlebars.compile(myAccountTemplate)
		});

		app.MyAccountController = Ember.Controller.extend({
            needs: ["topNav"],
            jabberState: "",
            webexState: "",
            init: function(){
                var self = this;

                tenantService.getTenantInfo().then(function(tenantInfo){
                    self.set("isJabberEnabled", tenantInfo.JabberInfo.JabberEnabled || false);
                    self.set("isWebexEnabled", tenantInfo.WebexInfo.WebexEnabled || false);
                });
            },
            resetFields: function() {
              this.jabberMessage = "";
              this.webexMessage = "";
              this.jabberError = false;
              this.webexError = false;

            },

            isJabberConnecting: function() {
                return this.jabberState === "connecting";
            }.property("jabberState"),

            isJabberUpdating: function() {
                return this.jabberState === "updating";
            }.property("jabberState"),

            isJabberUpdateIdle: function() {
                return this.jabberState === "";
            }.property("jabberState"),

            isWebexConnecting: function() {
                return this.webexState === "connecting";
            }.property("webexState"),

            isWebexUpdating: function() {
                return this.webexState === "updating";
            }.property("webexState"),

            isWebexUpdateIdle: function() {
                return this.webexState === "";
            }.property("webexState"),

            actions: {
                updateJabberDetails: function() {
                    var self = this;
                    Ember.set(self, "jabberState", "connecting");

                    self.set("jabberError", false);
                    self.set("jabberMessage", "");

                    jabberService.isValidCredentials(self.get("model.jabberUsername"), self.get("model.jabberPassword"))
                        .then(function(){
                            Ember.set(self, "jabberState", "updating");

                            usersService.editProfile(self.get("model.username"), {
                                jabberUsername:  self.get("model.jabberUsername"),
                                jabberPassword:  aesUtil.encrypt(self.get("model.jabberPassword"))
                            }).then(function() {
                                Ember.set(self, "jabberState", "");

                                self.set("jabberMessage", "Jabber details updated successfully.");
                                self.set('controllers.topNav.refreshJabberLogin', true);

                                Ember.run.later((function() {
                                    self.set("jabberMessage", "");
                                }), 5000);
                            }).fail(function(err){
                                self.set("jabberError", true);
                                self.set("jabberMessage", "Internal Server Error.");
                                Ember.set(self, "jabberState", "");

                                Ember.run.later((function() {
                                    self.set("jabberMessage", "");
                                    self.set("jabberError", false);
                                }), 5000);
                            });;
                        }).fail(function(err) {
                            self.set("jabberError", true);
                            self.set("jabberMessage", err);
                            Ember.set(self, "jabberState", "");

                            Ember.run.later((function() {
                                self.set("jabberError", false);
                                self.set("jabberMessage", "");
                            }), 5000);
                        });

                },
                updateWebexDetails: function() {
                    var self = this;
                    Ember.set(self, "webexState", "connecting");
                    webExService.validateCredentials(self.get("model.webexId"), aesUtil.encrypt(self.get("model.webexPassword"))).then(function(response){
                            Ember.set(self, "webexState", "updating");
                            usersService.editProfile(self.get("model.username"), {
                                webexId: self.get("model.webexId"),
                                webexPassword: aesUtil.encrypt(self.get("model.webexPassword"))
                            }).then(function () {
                                Ember.set(self, "webexState", "");

                                self.set("webexMessage", "Webex details updated successfully.");
                                Ember.run.later((function () {
                                    self.set("webexMessage", "");
                                }), 5000);
                            }).fail(function(err){
                                self.set("webexError", true);
                                self.set("webexMessage", "Internal Server Error.");
                                Ember.set(self, "webexState", "");

                                Ember.run.later((function() {
                                    self.set("webexMessage", "");
                                    self.set("webexError", false);
                                }), 5000);
                            });
                    }).fail(function(err){
                        self.set("webexError", true);
                        if(err.status ===404)
                            self.set("webexMessage", "Webex Details Invalid.");
                        else
                            self.set("webexMessage", "Webex Server Error.");
                        Ember.set(self, "webexState", "");

                        Ember.run.later((function() {
                            self.set("webexMessage", "");
                            self.set("webexError", false);
                        }), 5000);
                    });

                }
            }
		});
});