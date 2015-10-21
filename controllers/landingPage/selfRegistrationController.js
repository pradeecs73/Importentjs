define(['services/landingAppService', 'ember', 'controllers/landingPage/selfRegistrationValidator'],
    function (landingAppService, Ember, selfRegistrationValidator) {

   var SelfRegistrationController = Ember.ObjectController.extend({
       queryParams: ['username'],
       username: "",
       errors: {},
       status: {
           success: false,
           message: ""
       },
       clearValidationErrors: function() {
         this.set("errors", {});
       },
       constructProfile: function(username,firstname,lastname,captcha){
           var request = {
               'Username' : username,
               'First Name' : firstname,
               'Last Name' : lastname,
               'captcha' : captcha
           };
         return request;
        },

        actions: {
            reset: function() {
                $("#firstname").val("");
                $("#lastname").val("");
                this.set("status",{success:false, message: "" });
                this.set('errors', {})
            },

            register: function () {
                var email = $("#username").val();
                var firstname = $("#firstname").val();
                var lastname = $("#lastname").val();
                var captcha = $("#jcaptcha").val();

                var self = this;
                var request = self.constructProfile(email,firstname,lastname, captcha);
                self.set("errors", {});
                self.set("status",{success:false, message: "" });

                var registerDoc = {
                    username: email,
                    firstName: firstname,
                    lastName: lastname
                }

                var registerValidator = selfRegistrationValidator.create(registerDoc);
                registerValidator.validate().then(function () {
                    if (registerValidator.get("isValid")) {
                        landingAppService.registerUser(request)
                            .then(function (response) {
                                self.set('errors', {});
                                self.set("status",{success:true, message:"successful"});
                            })
                            .fail(function (response) {
                                if(response.responseText === "Captcha verification failed") {
                                    self.set("status",{success:false, message:"Captcha verification failed, Please refresh the page to get a new captcha and try again"});
                                } else {
                                    self.set("status",{success:false, message:"User Registration Failed. Please contact Admin for the issue."});
                                }
                            });
                    }else {
                        self.set('errors', registerValidator.errors)
                    }
                });
            }
        }
    });

    return {
        SelfRegistrationController : SelfRegistrationController
    }
});