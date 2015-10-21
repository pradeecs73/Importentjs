define(['app', 'httpClient', 'pages/documentItems', 'services/usersService', 'services/webExService', 'text!templates/managerUserItem.hbs', 'jabberService', 'services/endorsementService', 'services/tenantService', 'services/formallearning/userService'],
  function(app, httpClient, documentItems, userService, webExService, managerUserItemTemplate, jabberService, endorsementService, tenantService, roleSevice) {
    app.CheckBoxWithAction = Ember.Checkbox.extend({
        hookup: function() {
            var action = this.get('action');
            if(action){
                this.on('change', this, this.sendHookup);
            }
        }.on('init'),
        sendHookup: function(ev){
            var action = this.get('action'),
            controller = this.get('controller');
            controller.send(action, this.$().prop('name'), this.$().prop('checked'));
        },
        cleanup: function(){
            this.off('change', this, this.sendHookup);
        }.on('willDestroyElement')
    });

    app.EditUserView = Ember.View.extend({
      didInsertElement: function() {
        if (window.favorite) favorite.render();
      }
    });

    app.ManagerUserItemView = Ember.View.extend({
        click: function(evt) {
            if ($(evt.target).is('a')) {
              return;
            } else {
              this.controller.toggleVisitingCard();
              return false;
            }
        }    
    });
    app.ManagerUserItemController = Ember.ObjectController.extend({
      init: function() {
        this.initializeSelectedUsers();
        if (!Ember.TEMPLATES["managerUserItem"]) {
          Ember.TEMPLATES["managerUserItem"] = Ember.Handlebars.template(Ember.Handlebars.precompile(managerUserItemTemplate));
        }
          var self = this;

          tenantService.getTenantInfo().then(function(tenantInfo){
              Ember.set(self, "isMultiSelectEnabled", tenantInfo.WebexInfo.WebexEnabled || tenantInfo.JabberInfo.JabberEnabled || (self.parentController.pageName === "myTeam") || false);
          });
      },

      NUMBER_OF_EXPERTISE_TO_SHOW: 3,
      userChecked: false,
      jabberContacts: jabberService.model.contacts,
      reset: false,
      needs: ["myTeam"],
	  
      showandhideplp: function() {
        return (this.controllerFor('myTeam').get("manageruniqueid") == app.getUsername());
      }.property(),

      isManager: function() {
        return (this.get('model').reporteeNumber > 0)
      }.property(),

      roleDetails: function() {
          var allRoles = [];
          var self = this;
          _.each(this.parentController.roles, function(role) {
              var checked = false;
              var existingRole = _.find(self.get("model").roles, function (myRole) {
                  return role === myRole;
              });
              if(existingRole) {
                  checked = true;
              }

              allRoles.push({
                  name:role,
                  isChecked:checked
              });
          });
          return allRoles;
      }.property(),

      handleRoleChange: function(role, isChecked) {
          isChecked ? this.addRole(role) : this.removeRole(role);
      },

      addRole: function (role) {
          userService.addRole(this.get('model').username, role);
		  roleSevice.assignRole(this.get('model').username, role, true);
      },
      removeRole: function (role) {
          userService.removeRole(this.get('model').username, role);
		  roleSevice.assignRole(this.get('model').username, role, false);
      },

      isCurrentUser: function() {
        var username = (this.get('model')) ? this.get('model').username : "";
        var __username = 'Not Supplied';
        if(username){
            __username = username.toLowerCase();
        }
        return app.getUsername() == __username;
      }.property('username'),

      isGridView: function() {
        var currentView = this.get('parentController').get("_currentView");
        if(currentView == undefined) {
          return true;
        }
        return (currentView === "grid-view");
      }.property("parentController._currentView"),

      isCommaRequired: function() {
        if (this.get("model").location.city && this.get("model").location.country) {
          return ', '
        }
      }.property("this.model.location.city", "this.model.location.country"),

      mailTo: function() {
        return "mailto:" + this.get('model').username
      }.property("this.model.username"),

      observeModelFlag: function() {
       this.set('userChecked', this.get('model.flag'));
      }.observes('model.flag'),

      observeUserChecked: function() {
        var selectedUsers = this.get('parentController').get("selectedUsers");
        var model = this.get("model");
        if (this.userChecked) {
          var isAvailable = false;
          var jabberContact = _.find(this.jabberContacts, function(jabberContact) {
            return jabberContact.name.split('@')[0] === model.jabberUsername;
          });

          if (jabberContact && jabberContact.statusName === "available") {
            isAvailable = true;
          }
          selectedUsers.pushObject(
            {
              id: model.id,
              isAvailable: isAvailable,
              jabberUsername: model.jabberUsername,
              name: model.name,
              username: model.username,
              shortName: model.shortName,
              email: model.email
            });
          return;
        }
        var selectedUser = _.find(selectedUsers, function(selectedUser) {
          return selectedUser.id === model.id;
        });
        selectedUsers.removeObject(selectedUser);
        this.set('model.flag',false);
        if(this.get('parentController.allChecked')) {

          this.get('parentController').set('selectAll', true);
        }
      }.observes("userChecked"),

      observeSelectedUsers: function() {
        var selectedUsers = this.get('parentController').get("selectedUsers");
        var model = this.get("model");
        var me = _.find(selectedUsers, function(selectedUser) {
          return selectedUser.id === model.id;
        });
        me ? this.set("userChecked", true) : this.set("userChecked", false);
      }.observes("parentController.selectedUsers.@each"),

      observeDestroyYourself: function() {
        //Destroying myself, as while paginating, a new instance of me will be created by my parent
        this.destroy();
      }.observes("parentController.destroyYourself"),

      initializeSelectedUsers: function() {
        var parentController = this.get('parentController');
        var selectedUsers = parentController.get("selectedUsers");
        var model = this.get("model");
        var me = _.find(selectedUsers, function(selectedUser) {
          return selectedUser.id === model.id;
        });
        me ? this.set("userChecked", true) : this.set("userChecked", false);
      },

      profile: null,
      views: {
        "list-view": { "descriptionLength": 300, "titleLength": 100},
        "large-grid-view": { "descriptionLength": 400, "titleLength": 50},
        "grid-view": { "descriptionLength": 100, "titleLength": 45}
      },
      facebookUrl: function() {
        return "http://fb.com/" + this.get('model').social.facebook
      }.property("model"),
      twitterUrl: function() {
        return "http://twitter.com/" + this.get('model').social.twitter
      }.property("model"),
      linkedinUrl: function() {
        return "http://linkedin.com/in/" + this.get('model').social.linkedin
      }.property("model"),

      isAnExpert: function() {
        return this.get('model').adminAssignedExpertise.length !== 0;
      }.property('this.model.adminAssignedExpertise'),

      adminAssignedExpertiseForAutoComplete: function() {
        return _.map(this.get('model').adminAssignedExpertise, function(expertise){
          return {
            value: expertise.id,
            text: expertise.name
          }
        });
      }.property("this.model.adminAssignedExpertise"),

      selfTaggedExpertiseForAutoComplete: function() {
        return _.map(this.get('model').selfTaggedExpertise, function(expertise){
          return {
            value: expertise.id,
            text: expertise.name
          }
        });
      }.property("this.model.selfTaggedExpertise"),

      isLoggedInUser: function() {
        if (Ember.isEqual(this.get('model').username, (app.getUsername && App.getUsername())))
          return true
        else
          return false
      }.property('this.model.id'),

      roleAutoCompleteId: function() {
        return "role_" + this.get('model').id;
      }.property('this.model.id'),

      adminAssignedExpertiseAutoCompleteId: function() {
        return "adminAssignedExpertise_" + this.get('model').id;
      }.property('this.model.id'),

      selfTaggedExpertiseAutoCompleteId: function() {
        return "selfTaggedExpertise_" + this.get('model').id
      }.property('this.model.id'),

      descriptionLength: function() {
        var parentController = this.get("parentController")
        var currentView = parentController.get("_currentView")
        return this.views[currentView].descriptionLength
      }.property('parentController._currentView'),

      hasJabberGuestId: function() {
        return this.get('model').social && this.get('model').social.cucmId;
      }.property("model"),

      clearErrorMessage: function() {
        this.set('errorMessage', '')
      },

      sortExpertise: function(expertiseList) {
          function compareEndorsement(a, b) {
              return a == b ?  0 : a <  b ? 1 : -1
          }

          function compareName(a, b) {
              return a == b ?  0 : a <  b ? -1 : 1
          }

          function compare(a, b) {
              return compareEndorsement(a.endorsementCount, b.endorsementCount)
                  || compareName( a.name, b.name);
          }
          return expertiseList.sort(compare);
      },

      setTopExpertiseToModel : function() {
          var self = this;
          var endorsementPromise = endorsementService.getEndorsements(this.get('model').username, 'expertise');
          endorsementPromise.then(function (endorsementResponse) {
              var allEndorsedExpertise = [];
              var adminAssigned = self.get("model").adminAssignedExpertise;
              var allExpertise;
              if(adminAssigned) {
                  allExpertise = adminAssigned.concat(self.get("model").selfTaggedExpertise);
              } else {
                  allExpertise = self.get("model").expertise;
              }

              _.each(allExpertise, function (anExpertise) {
                  var endorsedExpertise = _.find(endorsementResponse, function (endorsedExpertise) {
                      if(anExpertise.id) {
                          return anExpertise.id == endorsedExpertise._id;
                      } else {
                          return anExpertise.expertiseId == endorsedExpertise._id;
                      }
                  })
                  anExpertise["endorsementCount"] = (endorsedExpertise == undefined) ? 0 : endorsedExpertise.endorsementCount;
                  allEndorsedExpertise.pushObject(anExpertise);
              })
              var topExpertise = _.first(self.sortExpertise(allEndorsedExpertise), [ self.NUMBER_OF_EXPERTISE_TO_SHOW]);
              Ember.set(self.get("model"), "topExpertise", topExpertise);
          })
      },
        toggleVisitingCard: function() {
            var model = this.get("model");
            this.toggleProperty('model.shouldShowVisitingCard');
            if (model.shouldShowVisitingCard) {
                this.get('parentController').hideAllVisitingCardsExcept(model.username);
                if(model.topExpertise == undefined) {
                    this.setTopExpertiseToModel();
                }
            }
        },

        removeExpertise: function(expertiseId, expertiseAssignmentType, expertiseName) {
            return userService.removeExpertise(this.get('model').username, this.get('model').shortName, expertiseId, expertiseAssignmentType, expertiseName);
        },

        setErrorMessage: function (message) {
            this.set('errorMessage', message)
            Ember.run.later(this, 'clearErrorMessage', 3000);
        },

        actions: {
        changefilterarrayvalue:function(managerid,managerusername){
           var self=this;
           this.controllerFor('myTeam').set("manageruniqueid", managerid);
           this.controllerFor('myTeam').set("managerUserName", managerusername);
           this.controllerFor('myTeam').set("filters", "");
           this.controllerFor('myTeam').set("searchText", "");
           this.controllerFor('myTeam').set("pageNumber", 1);
           this.controllerFor('myTeam').set("keepUserSelection", false);
          },
        addSelfTaggedExpertise: function(expertise, handleFailure, handleSuccess) {
          userService.addSelfTaggedExpertise(this.get('model').username, expertise).then(function() {
            handleSuccess()
          }).fail(function(error) {
            var status = error.status
            if (status === 409)
              handleFailure()
          })
        },
        addExpertise: function(value, handleFailure, handleSuccess) {
          var expertiseId = value.split("|")[0]
          var expertiseName = value.split("|")[1]
          var self = this;
          var adminAssignedExpertise = self.get("model").adminAssignedExpertise;
          var existingAdminAssignedExpertise = _.find(adminAssignedExpertise, function (expertise) {
              return expertise.id === expertiseId;
          });
          if(existingAdminAssignedExpertise) {
              this.setErrorMessage('Cannot assign an already assigned expertise.');
              self.toggleProperty("reset");
              handleFailure();
              return;
          }

          userService.addExpertise(this.get('model').username, this.get('model').shortName, expertiseId, expertiseName).then(function() {
            self.setErrorMessage('');
            adminAssignedExpertise.pushObject({
              id: expertiseId,
              name: expertiseName
            });
            self.toggleProperty("reset");
            handleSuccess()
          }).fail(function(error) {
            console.log(error)
            var status = error.status
            if (status === 409) {
              self.setErrorMessage('Cannot add an expertise that has been self tagged by the learner.');
              handleFailure()
            }
          })
        },

        removeAdminAssignedExpertise: function(expertiseId, handleFailure, handleSuccess) {
          var self = this;
          var adminAssignExpertise = self.get("model").adminAssignedExpertise;
          var expertiseTobeRemoved = _.find(adminAssignExpertise, function (expertise) {
            return expertise.id === expertiseId;
          });
          this.removeExpertise(expertiseId, "adminAssignedExpertise", expertiseTobeRemoved.name)
              .then(function(){
                  var adminAssignedExpertise = self.get("model").adminAssignedExpertise;
                  var expertiseToRemove = _.find(adminAssignedExpertise, function (expertise) {
                      return expertise.id === expertiseId;
                  });
                  adminAssignedExpertise.removeObject(expertiseToRemove);
                  handleSuccess()
              })
              .fail(handleFailure)
        },

        removeSelfTaggedExpertise: function(expertiseId) {
          var self = this;
		  var selfTaggedExpertise = self.get("selfTaggedExpertise");
          var expertiseTobeRemoved = _.find(selfTaggedExpertise, function (expertise) {
            return expertise.id === expertiseId;
          });
          this.removeExpertise(expertiseId, "selfAssignedExpertise", expertiseTobeRemoved.name)
            .then(function(){
                var selfTaggedExpertise = self.get("model").selfTaggedExpertise;
                var expertiseToRemove = _.find(selfTaggedExpertise, function (expertise) {
                    return expertise.id === expertiseId;
                });
                selfTaggedExpertise.removeObject(expertiseToRemove);
            });
        },
        toggleTile: function(id) {
          documentItems.toggleTile(id)
        },
        instantMeeting: function() {
          var model = this.get('model');
          var expertsDetails = [
            {
              expertId: model.shortName,
              expertEmail: model.email
            }
          ];
          webExService.instantMeeting(expertsDetails)
        },
        dummy: function() {

        }
      }
    })
  })

