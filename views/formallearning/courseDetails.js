 'use strict';
define(['../../app','pages/learningOfferings', 'httpClient', "text!templates/formallearning/coursedetails.hbs", 'pages/documentItems', 'services/usersService', 'underscore', 'pages/learningAssetScheduleCalender', 'services/kotg/taggingService',  "pages/messageModelHide", "services/formallearning/courseService", "services/formallearning/learningPlanService"],
    function(app, learningOfferings, httpClient, coursedetailsTemplate, documentItems, usersService, _, learningAssetScheduleCalender, taggingService,  messageModelHide, courseService, learningPlanService) {

 App.LearningCourseView = Ember.View.extend({
            template: Ember.Handlebars.compile(coursedetailsTemplate),
            didInsertElement: function() {
                var learningCourseView = this;
                messageModelHide.addHideMessageModelEvent("successMessageDiv");
                Ember.run.scheduleOnce('afterRender', this, 'fetchRecentReaders');
                Ember.run.scheduleOnce('afterRender', this.controller, 'fetchAllLearningPlan');

                try {
                    if (learningCourseView.controller.get('model').activityId) {
                        this.fetchSelectedTags(learningCourseView.controller.get('model').activityId);
                    }
                    var self = this;
                    $("#tag_strip").off("cloudlet:activity", "**");
                    $("#tag_strip").on("cloudlet:activity", function() {
                        var tags = window.tags.getSelectedTags();
                        self.controller.set("selectedTags", tags);
                    });

                } catch (err) {
                    console.log("Failed to get data from Tags service: " + err);
                }

                try {
                    app.displayContentInNewTab("courseOverView");
                } catch (err) {
                    console.log("Error in Content Full View: " + err);
                }


                try {
                    if (window.tags) {
                        window.tags.render();
                    }
                } catch (err) {
                    console.log("Failed to render Tags: " + err)
                }


                try {
                    // if (window.comments) window.comments.render();
                    if (window.social) window.social.render({
                        "like": true,
                        "rating": true,
                        "ratingOnly": true,
                        "follow": true,
                        "favorite": true,
                    });
                    if (window.activityStream) {
                        //Subscribing to Cloudlet Activity event published by cloudlet plugin
                        learningCourseView.$().on("cloudlet:activity", function(e, activity) {
                            learningCourseView.onCloudletActivity(activity);
                        });
                    }
                    /* Jiathis comments*/
                    if (window.UYANCMT) {
                        var model = learningCourseView.controller.get('model');
                        UYANCMT.loadBox(model.courseDetails.courseId, "course", model.courseDetails.title, model.username);
                    }
                    /* annotate old jisthis comment
                    if (window.UYANCMT && window.jiaThisAppId) {
                        if (jiaThisAppId == "%JIA_THIS_APP_ID%") {
                            return;
                        }

                        var baseUrl = window.location.protocol + "//" + window.document.domain;
                        var nickName = App.getShortname();
                        var faceUrl = App.profileImage(app.getUsername(), "mini");
                        var profileUrl = baseUrl + "/#/user/" + App.getUsername();
                        var model = learningCourseView.controller.get('model');
                        var entityType = "course";

                        learningCourseView.$().find('.uyan-comment').attr("appid", jiaThisAppId);
                        learningCourseView.$().find('.uyan-comment').attr("articletitle", model.courseDetails.title);
                        learningCourseView.$().find('.uyan-comment').attr("nickName", nickName);
                        learningCourseView.$().find('.uyan-comment').attr("faceUrl", faceUrl);
                        learningCourseView.$().find('.uyan-comment').attr("profileUrl", profileUrl);
                        learningCourseView.$().find('.uyan-comment').attr("entityType", entityType);

                        var createActivityStreamObject = function(model) {
                            var streamDataContract = new activityStream.StreamDataContract(model.courseDetails.courseId.toString());
                            streamDataContract.title = model.courseDetails.title;
                            streamDataContract.resourceUrl = "/#/learningCourse/" + model.courseDetails.courseId;
                            streamDataContract.authorUserName = model.username;
                            streamDataContract.verb = 'comment';
                            streamDataContract.objectType = 'course';
                            streamDataContract.resourceId = model.courseDetails.courseId + '';

                            return streamDataContract;
                        };
                        
                        UYANCMT.load(jiaThisAppId, model.courseDetails.courseId, null, model.courseDetails.title, nickName, faceUrl, profileUrl, null, entityType, function(data) {
                            try {
                                var streamDataContract = createActivityStreamObject(model);
                                activityStream.pushToStream(streamDataContract);
                            } catch (err) {
                                Ember.Logger.error("Publishing activity to AS failed due to: " + err)
                            }
                        });
                    }
                    */
                } catch (err) {
                    console.log("Failed to load services: " + err);
                }
                documentItems.popoverContact();
                var self = this;
                try {
                    learningOfferings.popOver();
                    learningOfferings.sortOver();
                    learningOfferings.sharedPopOver();
                    var model = self.controller.get('model')
                    if (model.successStatus) {
                        jQuery("#successMessageDiv").removeClass('hide');
                        model.successStatus = false;
                    }
                } catch (error) {
                    console.log(error);
                }
                learningAssetScheduleCalender.initializeLearningPlan();

            },
            fetchSelectedTags: function(entityId) {
                var self = this;
                taggingService.fetchSelectedTags(entityId, "course").then(function(tags) {
                    self.controller.set("selectedTags", tags);
                });
            },
            onCloudletActivity: function(activityType) {
                var model = this.controller.get('model');
                var recentReaders = model.recentReadersUserData;
                var streamDataContract = null;
                //push to activity stream
                if (activityType.activity == "favorite" && activityType.entityType == "users") {
                    _.each(recentReaders, function(recentReader) {
                        if (recentReader.email == activityType.entityId) {
                            streamDataContract = new activityStream.StreamDataContract(activityType.entityId, 'USER');
                            streamDataContract.title = recentReader.shortName;
                            streamDataContract.resourceUrl = "/#/user/" + activityType.entityId;
                            streamDataContract.verb = 'follow';
                            streamDataContract.authorUserName = activityType.entityId;
                        }
                    });
                } else {
                    streamDataContract = new activityStream.StreamDataContract(model.courseDetails.courseId.toString(), 'course');
                    streamDataContract.resourceUrl = "#/learningCourse/" + model.courseDetails.courseId + "?coursetype=" + model.courseDetails.type;
                    streamDataContract.title = model.courseDetails.title;
                    if (activityType.activity == favorite.getConfig().pluginType) {
                        streamDataContract.verb = 'favorite';
                    }
                    streamDataContract.authorUserName = "ccl@cisco.com";
                }

                switch (activityType.activity) {
                    case comments.getConfig().pluginType:
                        streamDataContract.verb = 'comment';
                        break;
                    case rating.getConfig().pluginStateOn:
                        streamDataContract.verb = 'rate';
                        break;
                    case rating.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-rate';
                        break;
                    case follow.getConfig().pluginStateOn:
                        streamDataContract.verb = 'follow';
                        break;
                    case like.getConfig().pluginStateOn:
                        streamDataContract.verb = 'like';
                        break;
                    case favorite.getConfig().pluginStateOn:
                        streamDataContract.verb = 'favorite';
                        break;                    
                    case follow.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-follow';
                        break;
                    case like.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-like';
                        break;
                    case favorite.getConfig().pluginStateOff:
                        streamDataContract.verb = 'un-favorite';
                        break;
                }
                activityStream.pushToStream(streamDataContract);
            },
            fetchRecentReaders: function(){
                var self = this;
                var courseId = this.get("controller.model").get("courseDetails.courseId");
				var recentReadersUserData = this.get("controller.model").get("courseDetails.recentParticipants");
				self.getRecentReadersuserEmails(recentReadersUserData).then(function(recentReadersUserData){
					self.set('controller.model.recentReadersUserData', recentReadersUserData);
					self.set('controller.recentReadersUserData.data', recentReadersUserData);
					self.set('controller.recentReadersUserDataLength', recentReadersUserData.length);
				})
            },
            getRecentReadersuserEmails: function(recentReaders) {
                var emails = [];
                _.each(recentReaders, function(object) {
                    emails.push(object.email);
                });
                emails = _.uniq(emails);
				return usersService.users(emails).then(function(users) {
                        var _users = [];
                        _.each(users, function(user) {
                            if (user.email) {
                                user.email = user.email.replace(/[\.@]/g, '_');
                                _users.push(user);
                            }
                        });
                        return _users;
                    }, function(err) {
                        console.log(err);
                        return [];
                    });
            }
        });
 });
