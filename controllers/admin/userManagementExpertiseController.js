"use strict";

define(["app", "services/usersService", "services/expertiseService", 'underscore', 'emberValidator'],
  function(app, usersService, expertiseService, _) {

    App.FocusInputComponent = Ember.TextField.extend({
      becomeFocused: function() {
        this.$().focus();
      }.on('didInsertElement')
    });

    app.UserManagementExpertiseController = Ember.ObjectController.extend({
      queryParams: ['pageNumber','searchtextvalue'],
      searchtextvalue:'',
      pageNumber:1,
      newExpertise: '',
      errorMessage: "",
      successMessage: "",
      disabled: false,
      sortedExpertise : function(){
        return _.sortBy(this.get('model').allExpertise, function(expertise){ return expertise.name.toLowerCase()});
      }.property('model.allExpertise.@each', 'model.allExpertise.@each.name'),
      observesNewExpertise: function(){
        if(this.get('newExpertise') !== ''){
          this.set('successMessage', '')
        }
      }.observes('newExpertise'),
      alreadyPresent: function(newExpertiseName) {
        var model = this.get('model');
        var allExpertise = model.allExpertise;
        return _.find(allExpertise, function(existingExpertise) {
          return existingExpertise.name.toUpperCase() === newExpertiseName.toUpperCase();
        })
      },
      expertisesearchvalue: '',
      expertisesearchvaluechange: function() {
        this.set('expertisesearchvalue',this.get('searchtextvalue'));
      }.observes('searchtextvalue'),
      populateShortNames: function(){
        var allExpertise = this.get('model').allExpertise;
        var createdByUsers = _.map(allExpertise,function(expertise){return expertise.createdBy});
        var updatedByUsers = _.map(allExpertise,function(expertise){return expertise.updatedBy});
        var assignedExperts = _.map(allExpertise,function(expertise){
          if(_.isUndefined(expertise.experts))
            return [];
          return expertise.experts;
        });
        usersService.users(_.uniq(_.union(createdByUsers, updatedByUsers))).then(function(userProfiles){
          _.forEach(allExpertise,function(expertise){
            var createdByShortName = _.find(userProfiles, function(userProfile){ return userProfile.username == expertise.createdBy}).shortName;
            var updatedByShortName = _.find(userProfiles, function(userProfile){ return userProfile.username == expertise.updatedBy}).shortName;

            Ember.set(expertise, "experts", _.isUndefined(expertise.experts) ? [] : expertise.experts)
            Ember.set(expertise, "createdByShortName", createdByShortName)
            Ember.set(expertise, "updatedByShortName", updatedByShortName)
          })
        });
      }.observes('model.allExpertise'),
      actions: {
        add: function() {
          var self = this;
          var model = this.get('model');
          var newExpertiseName = self.get('newExpertise').trim();
          var createdByUsers = _.map(model.allExpertise,function(expertise){return expertise.createdBy});
          var createdByShortNames = _.map(model.allExpertise,function(expertise){return expertise.createdByShortName});
          var username = createdByUsers[0];
          var shortName = app.getShortname();
          this.set('errorMessage', '');
          this.set('successMessage', '');
          var expertiseObject = app.AdminExpertiseItem.create({expertise: newExpertiseName});
          expertiseObject.errors.clear();
          expertiseObject.validate().then(function() {
            if (!expertiseObject.get("isValid")) {
              self.set('errorMessage', expertiseObject.get('errors.expertise').join(", "));
            } else if (self.alreadyPresent(newExpertiseName)) {
              self.set('errorMessage', "This area of expertise already exists")
            } else {
              return expertiseService.createExpertise(newExpertiseName, shortName, username)
                .then(function(response) {
                  self.get('target.router').refresh();
                  //self.get('model').allExpertise.pushObject({name: newExpertiseName, id: response.expertiseId});
                  self.set('successMessage', 'Your area of expertise '+ newExpertiseName + ' has been added. It may take a few moments for the new area of expertise to reflect across the platform')
                  self.set('newExpertise', '');
                  self.set('errorMessage', '');
                }).fail(function(err){
                  self.set('errorMessage', err.responseJSON.errors[0])
                  self.set('successMessage', '')
                });
            }
          })
        },
        searchbyexpertise:function()
        {
            var self=this;
           self.set("searchtextvalue",self.get('expertisesearchvalue'));
        },
        gotoPage: function(pageValue){
          this.set('pageNumber', pageValue)
        }
      }
    });

    return app;
  });
