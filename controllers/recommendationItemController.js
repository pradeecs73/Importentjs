"use strict";

define(["app", "services/usersService"],
  function(app, usersService) {
    app.RecommendationItemController = Ember.ObjectController.extend({
      actions: {
        approve: function(recommendedByName) {
          var self = this;
          var model = this.get("model");
          var userId = this.parentController.get('model').username;
          return usersService.approveRecommendation(model.id, userId, model.recommendedBy, recommendedByName,model.message,model.recommendedByShortName).then(function(response){
            self.set("model.status", "APPROVED");
            return response;
          })
        },
        reject: function(recommendedByName) {
          var self =this;
          var model = this.get("model");
          var userId = this.parentController.get('model').username
          return usersService.rejectRecommendation(model.id, userId, model.recommendedBy, recommendedByName,model.message,model.recommendedByShortName).then(function(response){
            self.set("model.status", "REJECTED");
            return response;
          })
        }
      }
    });

    return app;
  });
