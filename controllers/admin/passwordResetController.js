'use strict';
    define(['app', 'text!templates/admin/passwordReset.hbs', 'httpClient'],
        function(app, passwordResetTemplate, httpClient) {
          app.PasswordResetView = Ember.View.extend({
            template: Ember.Handlebars.compile(passwordResetTemplate)
          });


          App.PasswordResetController = Ember.ObjectController.extend({
                email : "",
                successMessage : "",
                errorMessage : "",
                actions: {
                    resetPassword : function() {
                        var self = this;
                        httpClient.get("/knowledgecenter/userpi/admin/resetPassword?username=" + this.email).then(function (response) {
                            self.set("errorMessage","");
                            self.set("successMessage", "Password reset request has been successfully sent to the registered email id for " + self.email);
                        }).fail(function(err) {
                            if(err.status === 500)
                                self.set("errorMessage", "Something went wrong");
                            else
                                self.set("errorMessage", JSON.parse(err.responseText).errors.join());
                            self.set("successMessage", "");
                        });
                    }
                }
          });
    });

