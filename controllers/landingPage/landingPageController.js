define(['services/landingAppService', 'ember', 'controllers/landingPage/landingPageValidator'],
    function (landingAppService, Ember, landingPageValidator) {

    var LandingPageController = Ember.ObjectController.extend({
        email: "",
        errors: {},
        clearValidationErrors: function() {
            this.set("errors", {});
        },
        actions: {
            login: function () {
                var self = this;
                var updatedDoc = {
                    email: this.email.trim()
                }
                self.set("errors", {});
                var document = landingPageValidator.create(updatedDoc);
                document.validate().then(function () {
                    if (document.get("isValid")) {
                        self.set("errors", {});
                        landingAppService.isSSOEnabled().then(function(response) {
                          if(response.ssoEnabled) {
                              window.location = "/indexPostLogin.html?username=" + updatedDoc.email;
                          } else {
                              landingAppService.getUserStatus(updatedDoc.email).then(function (response) {
                                  switch(response.status) {
                                      case "unregistered":
                                          self.transitionToRoute("selfRegistration", {
                                              queryParams: {
                                                  username: updatedDoc.email
                                              }
                                          });
                                          break;
                                      case "registered":
                                          window.location = "/indexPostLogin.html?username=" + updatedDoc.email;
                                          break;
                                      case "pending":
                                          self.set("errors", {pending: "Your registration is in pending state."})
                                          break;
                                  }
                              });
                          }
                        });
                    }else {
                        self.set('errors', document.errors)
                    }
                });
            }
        }
    });

    return {
        LandingPageController : LandingPageController
    }
});