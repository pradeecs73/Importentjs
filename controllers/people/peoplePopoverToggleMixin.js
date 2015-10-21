'use strict'

define(['app'], function (app) {
    app.PeoplePopoverControllerMixin = Ember.Mixin.create({
        needs: ["application"],
        refreshPopOver: function() {
          this.hideAllVisitingCards();
        }.observes("controllers.application.shouldRefreshPopOver"),

        hideAllVisitingCards: function () {
          if(this.get("model")) {
            var allUsers = this.getAllUsers();
            _.each(allUsers, function (contact) {
              Ember.set(contact, "shouldShowVisitingCard", false);
            })
          }
        },

        hideAllVisitingCardsExcept: function (username) {
            var allUsers = this.getAllUsers();
            var userNameAttribute = this.get("userNameAttribute");
            _.each(allUsers, function(contact) {
                if(contact[userNameAttribute] !== username) {
                    Ember.set(contact, "shouldShowVisitingCard", false);
                }
            })
        }
    });
})


