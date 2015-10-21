"use strict";

define(["app", "services/usersService", "services/expertiseService", 'underscore', 'emberValidator'],
  function(app, usersService, expertiseService, _) {

    app.AdminExpertiseItemController = Ember.ObjectController.extend({
      inEditMode: false,
      expertiseEditErrorMessage : "",
      expertiseEditSuccessMessage : "",
      oldExpertiseName: "",
      expertiseName: function() {
        return this.get("model").name;
      }.property(),
      expertiseFilter: function(){
        return "expertise:" + this.get("model").name;
      }.property(),
      expertiseEditSuccessMessageId: function(){
        return "successMessage" + this.get("model").id;
      }.property('model.id'),
      alreadyPresent: function(newExpertiseName) {
        var model = this.get("model");
        var allExpertise = this.parentController.get('model').allExpertise;
        return _.find(allExpertise, function(expertise) {
          return expertise.id !== model.id && expertise.name.toUpperCase() === newExpertiseName.toUpperCase();
        })
      },
      actions: {
        editAndSave: function() {
          var self = this;
          var newExpertiseName = $("#edit-area-of-expertise").val().trim();
          var loginName = app.getShortname();
          var expertiseObject = app.AdminExpertiseItem.create({expertise: newExpertiseName});
          expertiseObject.errors.clear();
          expertiseObject.validate().then(function() {
            if (!expertiseObject.get("isValid")) {
              self.set('expertiseEditErrorMessage', expertiseObject.get('errors.expertise').join(", "));
            } else if (self.oldExpertiseName.toUpperCase() !== newExpertiseName.toUpperCase() && self.alreadyPresent(newExpertiseName)) {
              self.set('expertiseEditErrorMessage', "This area of expertise already exists");
            } else if (self.oldExpertiseName === newExpertiseName) {
              self.set("inEditMode", false);
              self.set('expertiseEditErrorMessage','')
            } else {
              return expertiseService.updateExpertise(self.get("model").id, newExpertiseName, self.oldExpertiseName, loginName, self.get("model").createdBy)
                .then(function() {
                  self.set('expertiseEditSuccessMessage','Your update of area of expertise <b>'+ self.get("model").name +'</b> has been recorded as <b>'+ newExpertiseName +'</b>. It may take a few moments for the changes to reflect across the platform.')
                  self.set("model.name", newExpertiseName);
                  self.set("model.updatedByShortName", app.getShortname());
                  self.set("model.lastUpdated", window.Date());
                  self.set("inEditMode", false);
                  self.set('expertiseEditErrorMessage','')
                }).fail(function(err) {
                  if (err.responseJSON.errors[0])
                    self.set('expertiseEditErrorMessage', err.responseJSON.errors[0]);
                })
            }
          })
        },
        setEditMode: function(oldExpertise) {
          this.set('expertiseEditErrorMessage', '');
          this.set('expertiseEditSuccessMessage', '');
          this.set("inEditMode", true);
          this.set('oldExpertiseName', oldExpertise.name);
        },
        exitEditMode: function() {
          this.set('expertiseName', this.get('oldExpertiseName'));
          this.set("inEditMode", false);
          this.set('expertiseEditErrorMessage', '');
        },
        delete: function() {
          var self = this;
          var expertise = self.get('model');
          var shortName = app.getShortname();
          return expertiseService.deleteExpertise(expertise.id, expertise.name, shortName, expertise.updatedBy)
            .then(function() {
              var parentController = self.parentController;
              parentController.get('target.router').refresh()
              var parentModel = parentController.get('model');
              var allExpertise = parentModel.allExpertise;
              allExpertise.removeObject(expertise);
              self.set('expertiseEditErrorMessage', '');
            }).fail(function(err) {
              if (err.responseJSON.errors[0])
                self.set('expertiseEditErrorMessage', err.responseJSON.errors[0]);
              Ember.run.later(self, function(){self.set('expertiseEditErrorMessage', '')}, 3000)
            });
        }
      }
    });

    return app;
  });
