'use strict';

define(['app', 'text!templates/profile.hbs', 'pages/profile', 'pages/activity', "pages/learningPlan", 'services/formallearning/learningPlanService', 'text!templates/profileMyActivity.hbs', 'text!templates/profileplp.hbs', 'text!templates/profileRecentLearnings.hbs', 'text!templates/activitysettings.hbs', 'httpClient', 'services/usersService', 'services/webExService', 'services/groupService', 'services/expertiseService', 'services/formallearning/courseService','Q', 'emberPageble','controllers/utils/dateUtil', 'emberValidator', ],
    function(app, profileTemplate, profile, activity, pageLearningPlan, learningPlanService, profileMyActivityTemplate, profilePlpTemplate, profileMyRLTemplate, activitySettingsTemplate, httpClient, usersService, webExService, groupService, expertiseService, courseService, Q, emberPageble, dateUtil) {
  App.PaginationView = VG.Views.Pagination.extend({
    numberOfPages: 1
  });
  App.TableHeaderView = VG.Views.TableHeader.extend({
    template: Ember.Handlebars.compile(
        '{{#if view.isCurrent}}<i {{bindAttr class="view.isAscending:icon-sort-up view.isDescending:icon-sort-down"}}></i>{{/if}}{{view.text}}'
    )
  });
  app.ContactInfo = Ember.Object.extend(Ember.Validations.Mixin, {
    validations: {
        address: {
            length: {
                allowBlank: true,
                maximum: 200,
                messages: {
                    maximum: 'Maximum length allowed is 200 characters'
                }
            }
        },
      contactNumber: {
        format: {
          with: /^\+[1-9][0-9\-]+[0-9]$/,
          allowBlank: true,
          message: "Invalid format. Should follow the format +(country-code)(number) e.g.+91-9740-777-999"
        },
          length: {
              allowBlank: true,
              maximum: 20,
              messages: {
                  maximum: 'Maximum length allowed is 20 characters'
              }
          }
      },
      facebook: {
        format: {
          with: /^[a-zA-Z0-9_\.]+$/,
          allowBlank: true,
          message: "Invalid format. Should not contain any special characters except for _ (underscore) and .(period)"
        },
          length: {
              allowBlank: true,
              maximum: 50,
              messages: {
                  maximum: 'Maximum length allowed is 50 characters'
              }
          }
      },
      linkedin: {
        length: {
            allowBlank: true,
            maximum: 100,
            messages: {
                maximum: 'Maximum length allowed is 100 characters'
            }
        }
      },
      twitter: {
        format: {
          with: /^[a-zA-Z0-9_]+$/,
          allowBlank: true,
          message: "Invalid format. Should not contain any special characters except for _ (underscore)"
        },
          length: {
              allowBlank: true,
              maximum: 15,
              messages: {
                  maximum: 'Maximum length allowed is 15 characters'
              }
          }
      }
    }
  })

  app.Biography = Ember.Object.extend(Ember.Validations.Mixin, {
      validations: {
          biography: {
              length: {
                  allowBlank: true,
                  maximum: 1000,
                  messages: {
                      maximum: 'Maximum length allowed is 1000 characters'
                  }
              }
          }
      }
  }),

  app.AdditionalInfo = Ember.Object.extend(Ember.Validations.Mixin, {
      validations: {
          projectHistory: {
              length: {
                  allowBlank: true,
                  maximum: 200,
                  messages: {
                      maximum: 'Maximum length allowed is 200 characters'
                  }
              }
          },
          jobHistory: {
              length: {
                  allowBlank: true,
                  maximum: 200,
                  messages: {
                      maximum: 'Maximum length allowed is 200 characters'
                  }
              }
          },
          education: {
              length: {
                  allowBlank: true,
                  maximum: 200,
                  messages: {
                      maximum: 'Maximum length allowed is 200 characters'
                  }
              }
          }
      }
  })

  app.ProfileIndexRoute = Ember.Route.extend({
    redirect: function() {
      this.transitionTo("profile.my");
    }
  })

  app.ProfileMyView = Ember.View.extend({
    template: Ember.Handlebars.compile(profileTemplate),
    didInsertElement: function() {
      profile.initialize();

      // This code is only temporary for the purpose of showing how the jCrop works... please move appropriately;
      // This is a callback that detects when profile-image-upload modal opens and initializes the jCrop on the image

      jQuery(function($){

        var cropImage = $('#profileImageModal .user-image-wrapper .profileImg');

        cropImage.Jcrop({ boxWidth: 192, boxHeight: 190 });

        $('#profileImageModal').on('show.bs.modal', function (e) {
            cropImage.Jcrop({ boxWidth: 192, boxHeight: 190 });
        });


      });


    }
  })

  app.ProfileMyRoute = Ember.Route.extend({
    model: function() {
        return Q.all([
            usersService.myProfile(),
            usersService.myRecommendations()

        ]).spread(function(userData, recommendationsResponse) {
            userData.isMyProfile = true;
            userData["recommendations"] = recommendationsResponse.recommendations;
            return userData;
        }, function(error) {
            console.log("Error while retrieving user details");
        });
    },
    setupController: function(controller, model) {
      controller.set('errorMessage', '');
      controller.set('successMessage', '');
      controller.set('approveRejectErrorMessage', '');
      controller.set('editBiographyMode', false);
      controller.set('editMode', false);
      controller.set('editSelfTaggedExpertiseMode', false);
      controller.set('editContactInfoMode', false);
      controller.set('editAdditionalInfoMode', false);
      controller.set('addLearnerTaggedExpertiseMode', false);
      controller.set('model', model);
    },
    actions:{
      closeProfileImageUploadModal: function() {
        this.controllerFor("profileImageUpload").resetModel();
        this.refresh();
      },
      editProfileImage: function() {
        var profileImageUploadController = this.controllerFor("profileImageUpload");
        profileImageUploadController.resetModel();
        this.render("profileImageUpload", {
          into: 'application',
          outlet: 'modal',
          controller: profileImageUploadController
        });
      }
    }
  });

  app.ProfileMyController = Ember.ObjectController.extend({
    editBiographyMode: false,
    editMode: false,
    editSelfTaggedExpertiseMode: false,
    editContactInfoMode: false,
    editAdditionalInfoMode: false,
    addLearnerTaggedExpertiseMode: false,
    reset: false,
    groups: [],
    groupsAvailable: false,
    profileViewCountAvailable: false,
    errorMessage: '',
    successMessage: '',
    approveRejectErrorMessage: '',
    expertise: [],
    approvedRecommendations: [],
    pendingRecommendations: [],

    expertiseAutoSuggest: function() {
      return expertiseService.expertiseAutoSuggest();
    }.property(),

    populateRecommendations: function() {
        this.set("approvedRecommendations", this.getRecommendationsForStatus("APPROVED"));
        this.set("pendingRecommendations", this.getRecommendationsForStatus("PENDING"));
    }.observes('model'),

    observeRecommendationStateChange: function() {
        this.set("pendingRecommendations", this.getSortedRecommendationsForStatus("PENDING"));
        this.set("approvedRecommendations", this.getSortedRecommendationsForStatus("APPROVED"));
    }.observes('model.recommendations.@each.status'),

    getRecommendationsForStatus: function(status) {
        var recommendations = this.getSortedRecommendationsForStatus(status);
        var usernames = _.chain(recommendations).map(function(recommendation) {
            return recommendation.recommendedBy;
        }).uniq().value();
        usersService.basicProfiles(usernames).then(function(userProfiles) {
            _.each(recommendations, function(recommendation) {
                var userProfile = userProfiles[recommendation.recommendedBy];
                Ember.set(recommendation, "recommendedByShortName", userProfile.shortName);
                Ember.set(recommendation, "recommendedByJabberInfo", {jabberUsername: userProfile.jabberUsername});
                Ember.set(recommendation, "recommendedByImageUrl", userProfile.profileMiniImageTempUrl);
            });
        });
        return recommendations;
    },

    getSortedRecommendationsForStatus: function(status) {
        return _.chain(this.get('model').recommendations).filter(function(recommendation) {
            return recommendation.status == status;
        })
        .sortBy(function(recommendation) {
            return App.DateUtil.dateForDescendingSorting(recommendation.recommendedOn);
        }).value();
    },
    groupedPendingExpertise: function() {
      var pendingExpertise = _.chain(this.get("pendingExpertise"))
                              .groupBy(function(userExpertise) { // Group by date first
                                return userExpertise.assignedOn;
                              }).map(function(userExpertiseGroupedByDate, assignedOn){
                                    var groupedByUsers = _.chain(userExpertiseGroupedByDate)
                                        .groupBy(function (userExpertise) { // then group by assigned users
                                            return userExpertise.assignedBy;
                                        }).map(function (expertise, assignedBy) {
                                            return {assignedByUsername: assignedBy, expertise: expertise};
                                        })
                                        .sortBy(function(groupedByUser) {
                                            return groupedByUser.assignedByUsername;
                                        })
                                        .value();
                                    return {assignedOn: assignedOn, groupedByUsers: groupedByUsers};
                              })
                              .sortBy(function(pendingExpertiseOnADay) {
                                       // Descending order of time by converting it to time in milliseconds
                                       return App.DateUtil.dateForDescendingSorting(pendingExpertiseOnADay.assignedOn);
                              })
                              .value();

        var usernames = _.chain(pendingExpertise).map(function (groupedByDate) {
            return _.map(groupedByDate.groupedByUsers, function(groupedByUser) {
                return groupedByUser.assignedByUsername;
            });
        }).flatten().uniq().value();
        usersService.basicProfiles(usernames).then(function(userProfiles){
          _.each(pendingExpertise, function(groupedByDate) {
              _.each(groupedByDate.groupedByUsers, function(groupedByUser) {
                  var userProfile = userProfiles[groupedByUser.assignedByUsername];
                  Ember.set(groupedByUser,"assignedByShortName", userProfile.shortName);
                  Ember.set(groupedByUser,"assignedByUserJabberInfo", {jabberUsername: userProfile.jabberUsername});
                  Ember.set(groupedByUser, "assignedByImageUrl", userProfile.profileMiniImageTempUrl);
              })
          });
      });
      return pendingExpertise;
    }.property('pendingExpertise'),
    mailToEmail: function(){
      return "mailto:" + this.get("model")["email"]
    }.property("content"),

    hasManagerField: function () {
      return this.get("model")["managerName"] != ""
    }.property("managerName"),

            fetchGroupsForUser: function () {
                if (this.preferences["Collaboration"]) {
                    var profile = this.get('model')
                    var username = profile.username
                    var self = this
                    groupService.allGroupsFor(username).then(function (groups) {
                        self.set('groups', groups)
                        self.set('groupsAvailable', true)
                    }).catch(function (error) {
                        self.set('groups', [])
                        self.set('groupsAvailable', true)
                        console.log(error)
                    })
                }
            }.observes('model'),
            fetchExpertiseForUser: function () {
                var self = this
                usersService.pendingExpertise().then(function (pendingExpertise) {
                    self.set('pendingExpertise', pendingExpertise);
                }).catch(function (error) {
                    self.set('pendingExpertise', [])
                    console.log(error)
                })
                usersService.approvedExpertise().then(function (approvedExpertise) {
                    self.set('selfTaggedExpertise', approvedExpertise["selfTaggedExpertise"]);
                    self.set('adminAssignedExpertise', approvedExpertise["adminAssignedExpertise"]);
                }).catch(function (error) {
                    self.set('selfTaggedExpertise', []);
                    self.set('adminAssignedExpertise', []);
                    console.log(error)
                })
            }.observes('model'),

            fetchLearningPlansForUser: function () {
                if (this.preferences["FormalLearning"]) {
                    var self = this;
                    var data = {
                        "keyword": ""
                    };
                    learningPlanService.fetchLearningPlans(data).then(function (learningPlans) {
                        var prescribedLearningPlans = _.filter(learningPlans.learningPlans, function (plp) {
                            self.controllerFor('user').prescribedLearningPlanStatus(plp);
                            return plp.type == "Prescribed";
                        });
                        self.set("model.learningPlans", prescribedLearningPlans);
                    });
                }
            }.observes('model'),
            toggleEditBiographyMode: function () {
                this.set("editBiographyMode", !this.editBiographyMode);
            },
            toggleEditMode: function () {
                this.set("editMode", !this.editMode);
            },
            toggleEditContactInfoMode: function () {
                this.set("editContactInfoMode", !this.editContactInfoMode);
            },
            toggleEditAdditionalInfoMode: function () {
                this.set("editAdditionalInfoMode", !this.editAdditionalInfoMode);
            },
            toggleSelfTaggedExpertiseMode: function () {
                this.set("editSelfTaggedExpertiseMode", !this.editSelfTaggedExpertiseMode);
            },
            isCommaRequired: function () {
                if (this.get("model").location.city && this.get("model").location.country) {
                    return ' , '
                }
            }.property("this.model.location.city", "this.model.location.country"),

    cityOrCountry: function() {
      return this.get("model").location.city || this.get("model").location.country;
    }.property("this.model.location.city", "this.model.location.country"),

    updatePendingExpertiseInModel: function(expertiseId) {
      var pendingExpertise = this.get('pendingExpertise');
      var afterFilter = _.reject(pendingExpertise, function(eachExpertise) {
          return eachExpertise.id === expertiseId;
      });
      if(pendingExpertise.length != afterFilter.length) {
          this.set("pendingExpertise", afterFilter);
      }
    },

    onSelfTag: function(expertiseId, expertiseName, handleSuccess) {
      var addedExpertise = {
        id: expertiseId,
        name: expertiseName
      }
      this.get("selfTaggedExpertise").pushObject(addedExpertise);
      this.set('newSelfTaggedExpertise', '')
      this.set('successMessage', "Area of Expertise added successfully.");
      $('#expertise-input-box').find('.success').show().delay(5000).fadeOut('slow');
      this.set('errorMessage', '');
      this.updatePendingExpertiseInModel(expertiseId);
      handleSuccess();
      this.set('reset', !this.reset);
    },

    actions: {

      editContactInfo: function() {
        this.toggleEditContactInfoMode();
      },
      saveContactInfo: function() {
        var self = this
        var userId = this.get('model').username
        var loginshortname=this.get('model').shortName
        var contactInfo = {
          address: this.get('model')["location"]["address"],
          contactNumber: this.get('model')["contactNumber"],
          twitter: this.get('model')["social"]["twitter"],
          facebook: this.get('model')["social"]["facebook"],
          linkedin: this.get('model')["social"]["linkedin"]
        };

        var contactObject = app.ContactInfo.create(contactInfo);
        contactObject.errors.clear()
        contactObject.validate().then(function() {
          self.set('model.errors', {})
          if (contactObject.get('isValid')) {
            usersService.editProfile(userId, {
              contactNumber: self.get('model')["contactNumber"],
              location: self.get('model')["location"],
              social: self.get('model')["social"]
            },loginshortname,'Contact Info');
            self.toggleEditContactInfoMode();
           }
           else {
               self.set('model.errors', contactObject.errors)
           }
        })
      },

      editBiography: function() {
        this.toggleEditBiographyMode();
      },

      saveBiography: function() {
          var self= this;
          var biography = {
              biography: this.get('model')["description"]
          };
          var userId = this.get('model').username;
          var loginshortname=this.get('model').shortName;
          var biographyObject = app.Biography.create(biography);
          biographyObject.errors.clear()
          biographyObject.validate().then(function() {
              self.set('model.errors', {})
              if(biographyObject.get('isValid')){
                  var userId = self.get('model').username
                  var fieldValue = self.get('model')["description"]
                  var editedProfileJson = {}
                  editedProfileJson["description"] = fieldValue
                  usersService.editProfile(userId, editedProfileJson,loginshortname,'Biography')
                  self.toggleEditBiographyMode();
                  }
                else{
                    self.set('model.errors', biographyObject.errors)
               }
          });
      },

      editAdditionalInfo: function() {
        this.toggleEditAdditionalInfoMode();
      },

      saveAdditionalInfo: function() {
          var self= this;
          var model = this.get('model');
          var loginshortname=this.get('model').shortName;
          var additionalInfo = {
              projectHistory: model.projectHistory,
              jobHistory:model.jobHistory,
              education:model.education
          };
          var additionalInfoObject = app.AdditionalInfo.create(additionalInfo);
          additionalInfoObject.errors.clear()
          additionalInfoObject.validate().then(function() {
              self.set('model.errors', {})
              if(additionalInfoObject.get('isValid')){
                  var userId = self.get('model').username
                  var model = self.get('model');
                  var editedProfileJson = {}
                  editedProfileJson["education"] = model.education;
                  editedProfileJson["projectHistory"] = model.projectHistory;
                  editedProfileJson["jobHistory"] = model.jobHistory;
                  usersService.editProfile(userId, editedProfileJson,loginshortname,'Additional Info')
                  self.toggleEditAdditionalInfoMode();
              }else{
                  self.set('model.errors', additionalInfoObject.errors)
              }
          });
      },

      editSelfTaggedExpertise: function() {
          this.toggleSelfTaggedExpertiseMode();
          $('body').animate({
            scrollTop: ($('#expertise-input-box').offset().top - 100)
          }, 'slow', function(){
            $(this).find('input:text').focus();
          });
      },
      doneWithSelfTaggedExpertise: function() {
          this.toggleSelfTaggedExpertiseMode()
          this.set('errorMessage', '');
          this.set('successMessage', '');
      },
      addExpertise: function(value, handleFailure, handleSuccess) {
        var expertiseId = value.split("|")[0]
        var expertiseName = value.split("|")[1]
        var self = this
        var userId = this.get('model').username
        var loginshortname=this.get('model').shortName;

        return usersService.addSelfTaggedExpertise(userId, expertiseId,expertiseName,loginshortname).then(function(){
          self.onSelfTag(expertiseId, expertiseName, handleSuccess)
        }).fail(function(error) {
            var status = error.status
            if (status === 409) {
              self.set('errorMessage', 'You cannot tag yourself with an expertise already associated with your profile');
              self.set('successMessage', '')
              $('#expertise-input-box').find('.error').show().delay(5000).fadeOut('slow');
              handleFailure()
            }
            console.log(error)
        })
      },



      removeSelfAssignedExpertise: function(expertiseId, handleFailure, handleSuccess) {
        var self = this
        var userId = this.get('model').username
        var loginshortname=app.getShortname();
        var selfTaggedExpertise = self.get("selfTaggedExpertise");
        var expertiseToRemove = _.find(selfTaggedExpertise, function (expertise) {
          return expertise.id === expertiseId;
        });
        return usersService.removeSelfAssignedExpertise(userId, expertiseId, expertiseToRemove.name,loginshortname).then(function() {
            var removedExpertise = _.find( self.get("selfTaggedExpertise"), function(expertise) {
              return expertise.id === expertiseId;
            });
            self.get("selfTaggedExpertise").removeObject(removedExpertise);
            self.set('errorMessage', '')
            self.set('successMessage', '')
            handleSuccess()
        }).fail(function (error) {
            handleFailure()
        })
      },
      approveExpertise: function(assignedBy, expertise){
        var model = this.get('model');
        var userId = model.username;
        var shortName = model.shortName;
        var self = this;
        usersService.approveExpertise(userId, shortName, assignedBy, expertise.id, expertise.name).then(function(){
          self.get("selfTaggedExpertise").pushObject(expertise);
          self.updatePendingExpertiseInModel(expertise.id);
          self.set("approveRejectErrorMessage", "");
        }, function(error) {
          var status = error.status
          if (status === 409) {
            self.set("approveRejectErrorMessage", "This expertise is already part of your profile.");
          }
          console.log(error)
        });
      },
      rejectExpertise: function(expertise){
        var userId = this.get('model').username;
        var self = this;
        usersService.rejectExpertise(userId, expertise.id, expertise.name).then(function(){
          self.updatePendingExpertiseInModel(expertise.id);
          self.set("approveRejectErrorMessage", "");
        }, function(error) {
          var status = error.status
          if (status === 409) {
              self.set("approveRejectErrorMessage", "This expertise is already part of your profile.");
          }
          console.log(error)
        });
      }
    }
  });

  app.UserView = Ember.View.extend({
    template: Ember.Handlebars.compile(profileTemplate),
    didInsertElement: function() {
      Ember.run.scheduleOnce('afterRender', this, 'renderFollowPlugin');
      profile.initialize(this.$());
      /* Integrating Activity Stream for Profile Views */
      var myProfileViewCaptureForAS = this;
      this.set('recommendation', "");

      try {
        if (window.activityStream) {
          myProfileViewCaptureForAS.onCloudletActivity();
        }
      } catch (err) {
        console.log("Failed to load Activity Stream services: " + err);
      }
      //Separating the follow activity - shall be merged to the above block shortly
      try{
            if (window.activityStream) {
              myProfileViewCaptureForAS.$().on("cloudlet:activity", function(e, activityType) {
                myProfileViewCaptureForAS.onCloudletActivity(activityType)
              });
            }
      }catch(err){
         console.log("Failed to load follow Activity Stream services: " + err);
      }


    },
    onCloudletActivity: function(activityType) {
      var model = this.controller.get('model');
      //From activitystream, user can land into his own profile through userprofile route.
      // Hence disable capturing activity if its own profile of the logged in user.
      if(model.isMyProfile) {
          return;
      }
      var streamDataContract = null;
      var entityId, socialActivity;
      if(activityType){
        entityId = activityType.entityId;
        socialActivity = activityType.activity;
        streamDataContract = new activityStream.StreamDataContract(entityId, 'USER');
      }else{
        entityId = model.username;
        socialActivity = 'view';
        streamDataContract = new activityStream.StreamDataContract(entityId, 'profile', socialActivity);
      }
      try {
               streamDataContract.title = model.shortName;
               streamDataContract.resourceUrl = "/#/user/" + entityId;
               streamDataContract.authorUserName = entityId;
               streamDataContract.verb = socialActivity;
               activityStream.pushToStream(streamDataContract);
      } catch (err) {
        console.log("Error in capturing Activity Stream data" + err);
      }
    },

    renderFollowPlugin: function() {
      if (window.follow)
        window.follow.render();
    }
  });

  app.UserRoute = Ember.Route.extend({
    // Do not add any more than what is necessary in the model hook.
    // Other than the main user profile, everything else should be loaded as a lazy property
    // or via the afterModel hook.
    model: function(params) {
        return Q.all([
            usersService.userProfileFor(params.username),
            usersService.recommendationsFor(params.username)

        ]).spread(function(userData, recommendationsResponse) {
            userData.isMyProfile = userData["isCurrentUser"];
            userData["recommendations"] = recommendationsResponse.recommendations;
            return userData;
        }, function(error) {
            console.log("Error while retrieving user details");
        });
    },
      afterModel: function () {
          Ember.run.next(this, function() {
              Ember.set(this.controllerFor('application'), "currentPath", "bla");
              Ember.set(this.controllerFor('application'), "currentPath", "user");
          });
      },
    setupController: function(controller, model) {
      controller.set('recommendationErrorMessage', '');
      controller.set('recommendationSuccessMessage', '');
      controller.set('addLearnerTaggedExpertiseMode', false);
      controller.set('model', model);
    }
  });

  app.UserController = Ember.ObjectController.extend({
    groupsAvailable: false,
    profileViewCountAvailable: false,
    reset: false,
    recommendation: '',
    recommendationErrorMessage: '',
    recommendationSuccessMessage: '',
    addLearnerTaggedExpertiseMode: false,
    profileLinkValue: function(){
      return "#/user/" + this.get('model').username
    }.property(),

    mailToEmail: function(){
        return "mailto:" + this.get("model")["email"]
    }.property("content"),

    hasManagerField: function () {
        return this.get("model")["managerName"] != ""
    }.property("managerName"),
    activeMessage: function () {
        return this.get("model")["active"] ? "" : "This user is Inactive"
    }.property("model"),
    loggedInUsername: function() {
        return app.getUsername();
    }.property(),
    loggedInShortName: function() {
        return app.getShortname();
    }.property(),
    fetchGroupsForUser: function() {
        if(this.preferences.Collaboration) {
            var profile = this.get('model')
            var self = this
            groupService.allGroupsFor(profile.username).then(function (groups) {
                self.set('groups', groups)
                self.set('groupsAvailable', true)
                return groups
            }).catch(function (error) {
                self.set('groups', [])
                self.set('groupsAvailable', true)
                console.log(error)
            })
        }
    }.observes('model'),

    fetchExpertiseForUser: function() {
      var self = this
      var profile = this.get('model')

      usersService.approvedExpertiseFor(profile.username).then(function(approvedExpertise) {
        self.set('selfTaggedExpertise', approvedExpertise["selfTaggedExpertise"]);
        self.set('adminAssignedExpertise', approvedExpertise["adminAssignedExpertise"]);
      }).catch(function(error) {
        self.set('selfTaggedExpertise', []);
        self.set('adminAssignedExpertise', []);
        console.log(error)
      })
    }.observes('model'),

    isCommaRequired: function() {
      if (this.get("model").location.city && this.get("model").location.country) {
        return ', '
      }
    }.property("this.model.location.city", "this.model.location.country"),

    cityOrCountry: function() {
      return this.get("model").location.city || this.get("model").location.country;
    }.property("this.model.location.city", "this.model.location.country"),

    // Lazily retrieve the profile view count
    fetchProfileViewCount: function() {
      /* Start: Retrieving profile view count */
      var email = this.get('model').username
      var profileViewCountEndPoint = "/knowledgecenter/cclom/activities/profile/views?userEmailId=" + email
      var self = this
      return httpClient.get(profileViewCountEndPoint).then(function(profileViewCountResponse) {
        var profileViewCount = _.isUndefined(profileViewCountResponse.views) || profileViewCountResponse.views === 0 ? '' : profileViewCountResponse.views
        self.set('profileViewCount', profileViewCount)
        self.set('profileViewCountAvailable', profileViewCount > 0)
        return profileViewCount
      }).
        catch(function(error) {
        self.set('profileViewCount', '')
        self.set('profileViewCountAvailable', false)
        console.log(error.responseText)
      }).done()
      /* End: Retrieving profile view count */
    }.observes('model'),

            hasJabberGuestId: function () {
                return this.get('model').social && this.get('model').social.cucmId;
            }.property('model'),
            prescribedLearningPlanStatus: function (plp) {
                if (plp.type == "Prescribed") {
                    switch (plp.status) {
                        case 0:
                            plp.plpRegistered = false;
                            plp.plpAppeared = false;
                            break;
                        case 1:
                            plp.plpRegistered = true;
                            plp.plpAppeared = false;
                            break;
                        case 2:
                            plp.plpRegistered = true;
                            plp.plpAppeared = true;
                            break;
                        case 3:
                            plp.plpRegistered = false;
                            plp.plpAppeared = true;
                            break;
                    }
                }
            },
            fetchLearningPlansForUser: function () {
                if(this.preferences["FormalLearning"]) {
                    var self = this,
                        username = this.get('model').username;
                    learningPlanService.fetchUserPLPs(username).then(function (learningPlans) {
                        var prescribedLearningPlans = _.filter(learningPlans.learningPlans, function (plp) {
                            self.prescribedLearningPlanStatus(plp);
                            return plp.type == "Prescribed";
                        });
                        self.set("model.learningPlans", prescribedLearningPlans);
                    });
                }
            }.observes('model'),
            getRecommendationsForStatus: function (status) {
                var recommendations = _.chain(this.get('model').recommendations).filter(function (recommendation) {
                    return recommendation.status == status;
                })
                    .sortBy(function (recommendation) {
                        return App.DateUtil.dateForDescendingSorting(recommendation.recommendedOn);
                    }).value();

      var usernames = _.chain(recommendations).map(function(recommendation) {
        return recommendation.recommendedBy;
      }).uniq().value();
      usersService.basicProfiles(usernames).then(function(userProfiles) {
          _.each(recommendations, function(recommendation) {
            var userProfile = userProfiles[recommendation.recommendedBy];
            Ember.set(recommendation, "recommendedByShortName", userProfile.shortName);
            Ember.set(recommendation, "recommendedByJabberInfo", {jabberUsername: userProfile.jabberUsername});
            Ember.set(recommendation, "recommendedByImageUrl", userProfile.profileMiniImageTempUrl);
          });
      });
      return recommendations;
    },

    approvedRecommendations: function() {
      return this.getRecommendationsForStatus("APPROVED");
    }.property(),

    observeRecommendation: function(){
      if(this.get('recommendation') !== ''){
          this.set('recommendationErrorMessage', '')
      }
    }.observes("recommendation"),

    expertiseAutoSuggest: function() {
      return expertiseService.expertiseAutoSuggest();
    }.property(),

    actions: {
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
      initiateLearnerTaggedExpertise: function() {
        this.set('addLearnerTaggedExpertiseMode', true);
        $('body').animate({
          scrollTop: ($('#expertise-input-box').offset().top - 100)
        }, 'slow', function(){
          $(this).find('input:text').focus();
        });

      },
      doneWithLearnerTaggedExpertise: function(){
        this.set('addLearnerTaggedExpertiseMode', false);
        this.set('errorMessage', '');
        this.set('successMessage', '');
      },
      addLearnerExpertise: function(value, failureCallback, successCallback) {
        var expertiseId = value.split("|")[0];
        var expertiseName = value.split("|")[1];

        var userId = this.get('model').username
        var self = this;

        return usersService.addLearnerTaggedExpertise(userId, self.get('model').shortName, expertiseId, expertiseName).then(function(response) {
          self.set('errorMessage', '');
          self.set('successMessage', 'The Area of Expertise has been added and is awaiting approval.');
          $('#expertise-input-box').find('.success').show().delay(5000).fadeOut('slow');
          successCallback();
          self.set('reset', !self.reset);
        }).fail(function(error) {
          var errorStatus = error.status
          var statusMessage = { 409: 'Cannot tag an existing expertise.',
                                406: "You have already tagged this expertise."
          };
          if (errorStatus) {
            self.set('errorMessage', statusMessage[errorStatus]);
            self.set('successMessage', '');
            $('#expertise-input-box').find('.error').show().delay(5000).fadeOut('slow');
          }
          console.log(error);
          failureCallback();
        })
      },
      addRecommendation: function() {
          var self = this;
          var recommendedUserId = this.get('model').username;
          var recommendedUserShortName = this.get('model').shortName;

          if(this.recommendation.trim() === '') {
              self.setErrorMessage('Recommendation message cannot be empty.');
              return;
          }

          usersService.addRecommendation(recommendedUserId, recommendedUserShortName, this.recommendation).then(function(response) {
              self.set('recommendation', '');
              self.set('recommendationErrorMessage', '')
              self.set('recommendationSuccessMessage', 'Your recommendation for '+ recommendedUserShortName + ' has been recorded. It will appear on ' + recommendedUserShortName + '\'s profile once he/she approves it.');
              $('.recommendationSuccessMessage').show().delay(5000).fadeOut('slow');
          }, function(error) {
              self.setErrorMessage('Error while adding recommendation');
          });
      }
    },
    setErrorMessage: function(message) {
        this.set('recommendationSuccessMessage', '');
        this.set('recommendationErrorMessage', message);
        $('.recommendationErrorMessage').show().delay(5000).fadeOut('slow');
    }
  });



  app.ProfileMyactivityView = Ember.View.extend({
    template: Ember.Handlebars.compile(profileMyActivityTemplate),
    templateName: 'activity-stream',
    toggleView: function(view) {
                this.controller.set('_currentView', view);
            },
    didInsertElement: function() {
        var view = this;
        $(window).bind("scroll", function() {
            view.didScroll();
        });
        profile.initialize(this.$());
        activity.initialize();
        activity.visualSearch(this.$(), this.controller.get('model').objectTypeArray, this.controller.visualSearchCallBack, this, this.controller.preferences);

    },
    willDestroyElement: function() {
        $(window).unbind("scroll");
    },
    didScroll: function() {
        if (this.isScrolledToBottom()) {
          var self = this;
          var model = this.controller.get('model');
           self.controller.myActivities(model);
        }
    },
    isScrolledToBottom: function() {
        var distanceToTop = $(document).height() - $(window).height(),
            top = $(document).scrollTop();
        return top === distanceToTop;
    }
  });

  app.ProfileMyactivityController = Ember.ObjectController.extend({
    filter: "",
    postKey: function() {
        var self = this;
        var filter = this.get('filter');
        var model=self.get('model');
        var endPoint;
        model.search=filter;
        model.filter=[];
        if (filter != '') {
              endPoint="/knowledgecenter/cclom/activities/search/"+filter+"?restrict=mine&userEmailId=" +app.getEmailId();;
        } else {
              endPoint = "/knowledgecenter/cclom/aseread/my/activities/search/from/0/to/50/"+app.getEmailId();
        }

         httpClient.get(endPoint).then(function(response) {
          self.get('model').formattedActivities.clear();
          self.get('model').formattedActivities.pushObjects(self.formatAllActivitiesData(response).activityStream);

         }, function(err) {
          self.get('model').formattedActivities.pushObjects([]);
            console.log(err);

         });
    }.observes('filter'),
    perPage: 100,
    events: {
        getMore: function(activityFormatedData, model) {
            model.formattedActivities.clear();
            model.formattedActivities.pushObjects(activityFormatedData.activityStream);
            model.objectTypeArray = activityFormatedData.objectTypeArray;
            this.set('model', model);
            return model;
        }
    },
    myActivities:function(model){
      var self = this;
      var mymodel = this.get('model');
         var endPoint = "/knowledgecenter/cclom/aseread/my/activities/search";
          if (model.formattedActivities.length == 0) {
              endPoint = endPoint + '/from/0/to/50';
          } else {
              var from = 0;
              for (var t = 0; t < model.formattedActivities.length; t++) {
                  from = model.formattedActivities[t].myRecentActivities.length + from;

              }
              var to = from + 50;
              endPoint = endPoint + '/from/' + from + '/to/' + to;
          }

        endPoint=endPoint+'/'+app.getEmailId();

       $.getJSON(endPoint).then(function(activities) {
          if (activities.activities) {

              if (activities.activities.length == 1 || activities.activities.length == 0) {

                  var len = 0;
                  if (model.formattedActivities.length != 0) {
                      for (var t = 0; t < model.formattedActivities.length; t++) {
                          var length = model.formattedActivities[t].myRecentActivities.length;
                          len = len + length;
                      }
                      if (len > 7) {
                          model.set('status', 'No more data !');
                      }
                  }
              };
              if (model.myRecentActivities.length == 0) {

                  model.myRecentActivities = activities.activities;
                  var activityFormatedData = self.formatAllActivitiesData(activities);
                  model.formattedActivities.pushObjects(activityFormatedData.activityStream);

              } else {

                  var status = 0;
                  var stat = 0;
                  var activityLen = activities.activities.length;
                  var data = activities.activities.slice(0, activityLen);
                  model.myRecentActivities.pushObjects(data);
                  var activityFormatedData = self.formatAllActivitiesData(activities);
                  for (var i = 0; i < activityFormatedData.activityStream.length; i++) {
                      var activitiesLen = activityFormatedData.activityStream[i].myRecentActivities.length;
                      var dateKey = activityFormatedData.activityStream[i].dateKey;
                      var reducelength = model.formattedActivities.length;
                      for (var t = 0; t < model.formattedActivities.length; t++) {
                          var modelformatLen = model.formattedActivities[t].myRecentActivities.length;
                          var modeldateKey = model.formattedActivities[t].dateKey;
                          if (modeldateKey == dateKey) {
                              var data = activityFormatedData.activityStream[i].myRecentActivities.slice(0, activitiesLen);
                              model.formattedActivities[t].myRecentActivities.pushObjects(data);
                              reducelength -= 1;
                              status = 1;
                          } else {

                              reducelength -= 1;
                              stat = 1;

                          }
                      }
                      if (reducelength == 0) {
                          if (status != 1) {
                              if (stat == 1) {
                                  stat = 0;
                                  var data = activityFormatedData.activityStream[i];
                                  model.formattedActivities.pushObject(data);
                              }
                          } else {
                              status = 0;
                          }
                      }
                  }
              }
              model.objectTypeArray = activityFormatedData.objectTypeArray;
              return model;
          } else {
              model.myRecentActivities = [];
              model.formattedActivities.pushObjects([]);
              return model;
          }
      }, function(error) {
          return model;
      });
    },
   formatAllActivitiesData: function(data) {
      var dataLength;
      var self = this;
      data.activities.sort(self.activitySorter);
      var activityGroups = [],
          objectTypeArray = [];
      var today = new Date();
      var yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);
      var todayMonth = today.getMonth() + 1;
      var yesterdayMonth = yesterday.getMonth() + 1;
      var todayKey = today.getDate() + '-' + todayMonth + '-' + today.getFullYear();
      var yesterdayKey = yesterday.getDate() + '-' + yesterdayMonth + '-' + yesterday.getFullYear();
      if (data.type == "scroll") {
          dataLength = data.activities.length;
      } else {
          if (data.activities.length < 10) {
              dataLength = data.activities.length;
          } else {
              dataLength = this.perPage;
          }
      }
      for (var i = 0; i < dataLength; i++) {
          if (data.activities[i] && data.activities[i]._source) {
              var item = data.activities[i]._source;
              var date = new Date(item.published);
              var day = date.getDate();
              var year = date.getFullYear();
              var month = date.getMonth() + 1;
              var tempKey = day + '-' + month + '-' + year;

              if (todayKey === tempKey) {
                  tempKey = "Today";
              } else if (yesterdayKey === tempKey) {
                  tempKey = "Yesterday";
              }

              if (item.target) {
                  item.objectId = item.target.id;
                  item.objectType = item.target.objectType;
                  var activity = {
                      dateKey: tempKey,
                      activity: item
                  };
                  objectTypeArray.push(item.objectType);
                  activityGroups.push(activity);
              } else {
                  if (item.object) {
                      item.objectId = item.object.id;
                      item.objectType = item.object.objectType;
                      if (item.object.objectType == "blog") {
                          item.pathName = "blog";
                      } else if (item.object.objectType == "forum") {
                          item.pathName = "question";
                      }
                      if (item.object.ellipsisedContent) {
                          item.ellipsisedContent = item.object.ellipsisedContent;
                      }
                      if (item.object.url) {
                          item.url = item.object.url;
                      }
                      var activity = {
                          dateKey: tempKey,
                          activity: item
                      };
                      objectTypeArray.push(item.objectType);
                      activityGroups.push(activity);
                  }
              }
          }
      }
      //Group all activities by date
      var activityStream = {
          activityStream: [],
          objectTypeArray: _.uniq(objectTypeArray)
      };
      var dateKeyArray = _.pluck(activityGroups, "dateKey");
      if (dateKeyArray && dateKeyArray.length) {
          dateKeyArray = _.uniq(dateKeyArray);

          _.each(dateKeyArray, function(_dateKey) {
              var activityStreamItem = {
                  dateKey: _dateKey,
                  myRecentActivities: []
              };

              var activityStreamItemsByDateKey = _.where(activityGroups, {
                  "dateKey": _dateKey
              });

              _.each(activityStreamItemsByDateKey, function(activityStreamItemByDateKey) {
                  delete activityStreamItemByDateKey.dateKey;
                  activityStreamItem.myRecentActivities.push(activityStreamItemByDateKey.activity);
              });

              //activityStreamItem.activities.reverse();
              activityStream.activityStream.push(activityStreamItem);
          });
      }else{
        console.log(" new date key else part is here");
      }
      return activityStream;
    },
    activitySorter: function comp(a, b) {
        return new Date(b._source.published).getTime() - new Date(a._source.published).getTime();
    },
    filterScroll:function(key,context)
      {
          var self=this;
          var typeArr = [];
          var model=self.get('model');
          _.each(model.filter, function(obj,i) {
              if (obj.attributes.category == "Type") {
                  var value=obj.attributes.value;
                  if(typeArr.length!=0)
                  {
                      var status=0;
                      typeArr.forEach(function(res)
                      {

                          if(res==value)
                          {
                              status=1;
                          }
                      });
                      if(status!=1)
                      {
                          if(obj.attributes.value=="discussions") typeArr.push("forum"); else typeArr.push(obj.attributes.value);

                      }

                  }else{
                      if(obj.attributes.value=="discussions") typeArr.push("forum"); else typeArr.push(obj.attributes.value);
                  }
              }
          });
          var typeStream;
          typeArr.forEach(function(data)
          {
               if(typeStream)
               {

                  typeStream=typeStream+','+data;

               }else{

                  typeStream=data;
               }
          });
          var endPoint = "/knowledgecenter/cclom/activities/filter?userEmailId=" +app.getEmailId()+"&type=" + typeStream+"&restrict=mine";
          var len=typeStream.split(',').length;
          if(len==1 )
          {
              if(key=="visual")
              {
                  endPoint =endPoint +"&from=0&to=100";
                  model.start=100;

              }else{
                  var from=model.start;
                  to=from+100;
                  model.start=to;
                  endPoint =endPoint+"&from="+from+"&to="+to;

              }
          }else{

              var to=100/len;
              var from="";
              to=to.toString();
              if(typeof to.split('.')[1]=="undefined")
              {
                  if(key=="visual")
                  {
                      from=0;
                      to=parseInt(to);

                  }else{
                      from=model.start;
                      to=parseInt(to)+model.start;
                  }
              }else{
                  to=to.split('.')[0];
                  if(key=="visual")
                  {
                      from=0;
                      to=parseInt(to)+1;

                  }else{
                      from=model.start;
                      to=parseInt(to)+1;
                      to=model.start+to;
                  }

              }
              model.set('start',to);
              endPoint =endPoint +"&from="+from+"&to="+to;
          }

         httpClient.get(endPoint).then(function(response) {
            if(key=="visual")
              {
                  context.controller.get('model').formattedActivities.clear();
                  context.controller.get('model').formattedActivities.pushObjects(context.controller.formatAllActivitiesData({
                  activities: response.activities
                  }).activityStream);
              }else{
                  if(response.activities.length==0)
                  {
                      if(context.controller.get('model').formattedActivities!=0)
                      {
                          var activityLength=0;
                          _.each(context.controller.get('model').formattedActivities,function(objActivity)
                          {
                                   activityLength=activityLength+objActivity.activities.length;
                          });
                          if(activityLength>7)
                          {
                              model.set('status', 'No more data !');
                          }
                      }

                  }else{
                  var data=context.controller.formatAllActivitiesData({
                  activities: response.activities
                  }).activityStream;

                      for(var i=0;i<data.length;i++)
                      {
                          var datekey=data[i].dateKey;
                          var activitiesLen=data[i].activities.length;
                          var status=0;
                          for(var t=0;t<context.controller.get('model').formattedActivities.length;t++)
                          {
                              var existdateKey=context.controller.get('model').formattedActivities[i].dateKey;
                              if(existdateKey==datekey)
                              {
                                  status=1;
                                  var acStream =data[i].activities;
                                 context.controller.get('model').formattedActivities[i].activities.pushObjects(acStream);
                              }
                          }
                          if(status!=1)
                          {

                              context.controller.get('model').formattedActivities.pushObject(data[i]);
                          }
                      }

                  }

              }

          }, function(err) {

          });

      },
      visualSearchCallBack: function(context, searchCollection) {
          var model = context.controller.get('model');
          model.start= 0;
          model.search= "";
          model.filter=searchCollection.models;
          model.status='';
          if(searchCollection.models.length==0)
          {
                model.formattedActivities.clear();
                model.myRecentActivities.clear();
                context.controller.myActivities(model);
          }
          else{
              var key="visual";
              context.controller.filterScroll(key,context);
          }

      }
  });

  app.ProfileMyactivityRoute = Ember.Route.extend({

    setupController: function(controller, model) {
      controller.set('model', model);
    },
    model: function() {
      var model = {
          myRecentActivities: [],
          formattedActivities: [],
          status: "",
          to:"",
          page:50,
          filter:[],
          start:0,
          search:""
      }
      return this.getMyRecentActivities(model);
    },
    getMyRecentActivities: function(model) {
      var self = this;
       self.controllerFor('profileMyactivity').myActivities(model);
       return model;
    },
    actions: {
      reload: function() {
        var self = this;
          var model = this.modelFor('profileMyactivity');
          model.formattedActivities.clear();
          model.myRecentActivities.clear();
         self.controllerFor('profileMyactivity').myActivities(model);
      }
    }

  });

   app.ProfileMyrecentlearningsView = Ember.View.extend({
    template: Ember.Handlebars.compile(profileMyRLTemplate),
    didInsertElement: function() {
      profile.initialize(this.$());
    }
  });

  app.ProfileMyrecentlearningsController = Ember.ObjectController.extend({
    sort: "",
    completed: false,
    courses: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
          perPage: app.PageSize
      }),
    formatCourses: function (courses) {
        var isGridView = this.isGridView ? this.isGridView() : this.get('_currentView') == 'grid-view';
        _.each(courses, function (course) {
            if (course.isWebex || course.isIlt) {
                course.hideRegister = true;
            }
            course.isGridView = isGridView;
        });
        return courses;
    },
    sortSelected: function () {
        var self = this;
        self.courses.set("currentPage", 1);
        var coursesData = self.get("model").courses;
        var filter = self.get("sort"),
            courses = [];
        if (filter == "completed") {
            self.get('model').set('status', '');
            self.get('model').set('enrolled', true);
            _.each(coursesData, function (val, ind) {
                if (val.completed == 1) {
                    courses.push(val);
                }
            });
            if (courses.length == 0) {
                self.get('model').set('status', 'No courses to display');
            }
        } else if (filter == "progress") {
           self.get('model').set('status', '');
           self.get('model').set('enrolled', false);
            _.each(coursesData, function (val, ind) {
                if (val.completed != 1) {
                    courses.push(val);
                }
            });
            if (courses.length == 0) {
                self.get('model').set('status', 'No courses to display');
            }
        }
        self.courses.setProperties({"currentPage": 1, "data" : courses});
    }.observes("sort")
  });

  app.ProfileMyrecentlearningsRoute = Ember.Route.extend({
    setupController: function(controller, model) {
        var courses = []
        _.each(model.courses, function (val, ind) {
            if (val.completed != 1) {
                courses.push(val);
            }
        });
        controller.courses.setProperties({"currentPage": 1, 'data': courses });
        controller.setProperties({"sort": "progress", model: model});
    },
    model: function() {
        var self = this,
            model = Ember.Object.create({
                "courses": []
            }),
            queryParams = {
                enrol: 1, 
                limitTo:app.Infinity,
                type:"",
                category:""
            };
        return courseService.getCourses(queryParams).then(function(response) {
                model = Ember.Object.create({
                    "courses": response
                });
                model.courses = self.controllerFor("profileMyrecentlearnings").formatCourses(model.courses.courses, true);
                return model;
        }, function(error) {
                  console.log(error);
                  return model;
            });
    }
  });

  app.ProfileMyprescribedlearningplansView = Ember.View.extend({
    template: Ember.Handlebars.compile(profilePlpTemplate),
    didInsertElement: function() {
      profile.initialize(this.$());
    }
  });

  app.ProfileMyprescribedlearningplansRoute = Ember.Route.extend({
    setupController: function(controller, model) {
    var self = this;
    var prescribedLearningPlans = _.filter(model.learningPlans, function (plp) {
            self.controllerFor("user").prescribedLearningPlanStatus(plp);
            return plp.type == "Prescribed";
        });
        controller.learningPlans.setProperties({"currentPage": 1, 'data': prescribedLearningPlans });
        controller.setProperties({model: model});
    },
    model: function() {
        var self = this,
            model = {learningPlans: []},
            data = {
                "keyword": '',
                "limitTo":app.Infinity
            };
        return learningPlanService.fetchLearningPlans(data).then(function(learningPlans) {
            model = Ember.Object.create({
                learningPlans: learningPlans.learningPlans
            });
             return model;
        }, function(error) {
          return model;
        });
    }
  });

  app.ProfileMyprescribedlearningplansController = Ember.ObjectController.extend({
    learningPlans: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
          perPage: app.PageSize
      })
  });

  app.ProfileActivitysettingsView = Ember.View.extend({
    template: Ember.Handlebars.compile(activitySettingsTemplate),
    didInsertElement: function() {
      profile.initialize(this.$());
      retainActivityPreferences();
    }
  });

  Ember.Handlebars.registerBoundHelper('removeHTMLTagsForEllipsisDisplay', function(text) {
    if(text) {
      text = text.replace(/<(?:.|\n)*?>/gm, '');
    } else {
      text = "";
    }
    if(text.length >= 140) {
      text = text.substring(0,140);
    }
    return text;
  });

  return app;
});