'use strict';
define(['app', 'pages/learningOfferings', 'httpClient', "Q", "text!templates/formallearning/addToLearningPlanModel.hbs", 'text!templates/shareTemplete.hbs', 'text!templates/formallearning/coursedetails.hbs', 'services/usersService', 'underscore', 'text!templates/courseActivityCompleteModel.hbs', 'services/groupService', 'services/formallearning/courseService', 'services/formallearning/learningPlanService','services/formallearning/userService'],
    function (app, learningOfferings, httpClient, Q, addToLearningPlanModelTemplate, shareTemplete, coursedetailsTemplate, usersService, _, courseActivityCompleteModel, groupService, courseService, learningPlanService, learningUserServices) {

        App.LearningCourseRoute = Ember.Route.extend({
			enrollmentId: '',
            model: function (params) {
                var self = this,
                    model = {},
                    courseid = params.courseid;
                return courseService.getCourseDetails(courseid, params.coursetype).then(function (course) {
                    model = Ember.Object.create({
                        "username": app.getUsername(),
                        "comment": "",
                        "courseDetails": course,
                        "sessions": course.sessions,
                        "sessionCount": course.sessions.length,
                        "hasSessions": course.isWebex || course.isIlt ? true : false,
                        "courseTags": Ember.Object.create({
                            tags: []
                        }),
                        share: "",
                        stats: Ember.Object.create({
                            likes: 0,
                            views: 0
                        })
                    });
                    var courseIdList = [courseid];
                    App.StatsUtil.getCourseLikesCount(courseIdList)
                        .then(function (_likedCourses) {
                            if (_likedCourses.length == 1) {
                                model.stats.set("likes", _likedCourses[0].count);
                            } else {
                                model.stats.set("likes", 0);
                            }
                        });
                    App.StatsUtil.getViewCount(courseIdList).then(function (viewStats) {
						var viewsCount = JSON.parse(viewStats);
						if (viewsCount.length == 1) {
							model.stats.set("views", viewsCount[0].views);
						} else {
							model.stats.set("views", 0);
						}
                        });
                    try {
                        if (window.activityStream) {
                            var course = {
                                id: model.courseDetails.courseId,
                                title: model.courseDetails.title,
                                resourceUrl: "#/learningCourse/" + model.courseDetails.courseId + "?coursetype=" + model.courseDetails.type
                            };
                            setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(course, 'course', 'view');}), 0);
                        }
                    } catch (err) {

                    }
                    App.StatsUtil.getTagsForCourse(courseid).then(function (courseTags) {
                        if (courseTags.data) {
                            model.courseTags.set('tags', courseTags.data.value.split(","));
                        }
                    });
					if (model.courseDetails.enrollStatus == "PENDING") {
						model.courseDetails.enrollmentStatus = 1;
						model.pendingApproval = true;
					}
					_.each(model.sessions, function(session) {
						if (session.enrollStatus == "PENDING") {
							session.sessionEnrollmentStatus = 1;
							session.pendingApproval = true;
						}
					})
                    return model;
                }, function (error) {
                    jQuery('#status-message-div').addClass('hide');
                    Ember.set(self.controllerFor('catalog'), "showMessage", true);
                    Ember.set(self.controllerFor('catalog'), "isError", true);
                    return { 
                        "recentReadersUserData": []
                    };
                });
            },
            afterModel: function (model) {
                if (this.controllerFor('catalog').get('isError')) {
                    this.transitionTo('catalog');
                }
            },
            setupController: function (controller, model) {
			    var activityId = model.courseDetails.courseId;
				activityId = activityId.toString();
				model.set('activityId',activityId);
                controller.set('model', model);
				controller.setProperties({"cdFilter" : "all"});
				if(typeof model.sessionCount === 'undefined'){
					controller.set("sessionCount", 0);
				} else{
					if (model.hasSessions) {
						controller.set('sessions.data', model.sessions);
						//Start time
						var uniqueTime = app.DateUtil.sessionFilter.getFilters(model.sessions),
							timeFilterData = [],
							dates = uniqueTime ? Object.keys(uniqueTime) : [];
						_.each(dates, function (val, ind) {
							timeFilterData.push({
								label: "" + val,
								value: "" + uniqueTime[val]
							})
						});
						controller.set("sessionStartData", timeFilterData);

						timeFilterData = [];
						uniqueTime = app.DateUtil.sessionFilter.getFilters(model.sessions, true, "sessionEnddate");
						dates = uniqueTime ? Object.keys(uniqueTime) : [];
						_.each(dates, function (val, ind) {
							timeFilterData.push({
								label: "" + val,
								value: "" + uniqueTime[val]
							})
						});
						controller.set("sessionEndData", timeFilterData);

						if (model.courseDetails.isIlt) {
							var uniqueCityList = _.pluck(model.sessions, 'city');
							uniqueCityList = _.uniq(uniqueCityList.filter(function(city){ return city;}));
							controller.set("sessionCityData", uniqueCityList);
							controller.set("cityCount", uniqueCityList.length);
						}
						//converting minutes to HHMM
						var data = model.sessions,
						duration = []
						_.each(data, function (session, ind) {
							if(session.duration != 0){
								var sDuration = app.DateUtil.convertToHHMM(session.duration);
								controller.get('model').sessions[ind].duration = sDuration;
							}
							duration.push(session);
						});
						controller.set('sessions.data', duration);
					}
				}

                controller.set("currentPage", 1);
                controller.set("learningplanStatus", model.courseDetails.learningplanStatus);
                controller.set("enrollmentStatus", model.courseDetails.enrollmentStatus);
                controller.set("markAsComplete", model.courseDetails.markAsComplete);
				controller.set("completedOn", model.courseDetails.completedOn);
				App.DateUtil.setDateToLearningPlan(controller);
            },
            /* getUsers: function () {
                return usersService.allUsers();
            }, */
            getGroups: function () {
                return groupService.allGroups();
            },
            /* getCourseSharedDetails: function (courseId) {
                var self = this;
                var alreadySharedData = [];
                return learningUserServices.getSharedCourseDetails(courseId).then(function (courseSharedInfo) {
                    if (courseSharedInfo && courseSharedInfo.entityShares.length > 0) {
                        alreadySharedData = _.map(courseSharedInfo.entityShares, function (sharedObj) {
                            return {
                                'share': sharedObj.share,
                                'display': sharedObj.display
                            };
                        });
                        return alreadySharedData;
                    }
                    return alreadySharedData;

                }, function (err) {
                    return alreadySharedData;
                });
            }, */
            showStatusMessage: function (alertClass, iconClass, alertMsg) {
                jQuery('#successMessageDiv').removeClass('hide');
                jQuery('#successMessageDiv').removeClass().addClass("alert " + alertClass);
                jQuery('#status-message-icon').removeClass().addClass(iconClass);
                jQuery('#status-message-text').text(alertMsg); 
            },
            actions: {
                learningPlanModal: function (update) {
                    var date = new Date(),
						controller = this.controller,
						model = controller.get("model"),
                        courseId = model.courseDetails.courseId;
                    controller.set("courseId", courseId);
                    if (update) {
                        var learningPlans = controller.get("learningPlans"),
                            oldLearningPlanId = undefined,
                            learningPlanItemId = undefined;
                        for (var i = 0; i < model.learningPlans.length; i++) {
                            var learningPlan = learningPlans[i]
                            if (learningPlan.learningPlanItems) {
                                for (var j = 0; j < learningPlan.learningPlanItems.length; j++) {
                                    if (learningPlan.learningPlanItems[j].courseId == courseId) {
                                        learningPlanItemId = learningPlan.learningPlanItems[j].id;
                                        oldLearningPlanId = learningPlan.id;
                                        break;
                                    }
                                }
                                if (learningPlanItemId) {
                                    break;
                                }
                            }
                        }
                        controller.set("oldLearningPlanId", oldLearningPlanId);
                        controller.set("planId", oldLearningPlanId);
                        controller.set("learningPlanItemId", learningPlanItemId);
                        controller.set("update", true);
                    } else {
                        controller.set("update", false);
                    }
                    var errors = {}
                    model.set("errors", errors);
					if(model.learningPlans){
						if (model.learningPlans.length > 0){
							controller.set("planId", model.learningPlans[0].id);
						}
                    }
					Ember.TEMPLATES['addToLpOutletModal'] = Ember.Handlebars.compile(addToLearningPlanModelTemplate);
                    this.render('addToLpOutletModal', {
                        into: 'learningCourse',
                        outlet: 'addToLpModalOutlet'
                    });
                    jQuery('#addACourseToLP').modal('show');
                },
                addToLearningPlan: function (courseId, oldLearningPlanId, learningPlanItemId) {
					var controller = this.controller,
                        self = this,
                        model = controller.get("model"),
                        learningPlanName = controller.get("learningPlanName"),
                        PlanId = controller.get("planId"),
                        date = controller.get("learningPlanDate"),
                        message = "";
                    var currDate = app.todayDateinUnix;
                    var updateModelData = function (response) {
                            controller.set("learningPlanName", "");
                            jQuery('#addACourseToLP').modal('hide');
                            controller.set("learningplanStatus", 1);
                            if (oldLearningPlanId) {
								$.gritter.add({title:'', text: 'Course has been moved to learning plan successfully.', class_name: 'gritter-success'});
                            } else {
								$.gritter.add({title:'', text: 'Course has been added to learning plan successfully.', class_name: 'gritter-success'});
                            }
                            controller.fetchAllLearningPlan();
                        },
                        handleError = function (err) {
							var errors = {}
                            if (oldLearningPlanId) {
								errors.title = 'Error in moving course to learning plan.';
                            } else {
								errors.title = 'Unable to Create Learning Plan due to (Plan name already exists/Invalid title value)';
                            }
							model.set("errors", errors);
                            return;
                        };
                    if (learningPlanName) {
						 if(date == ""){
							var msg = "Date Should Not Be Empty";
						}else{
							date = App.DateUtil.formatInputDateWithGmt(date);
							if (date < currDate) {
								var msg = "Date Should Be Future Date";
							}
						}
                        var errors = {
                            date: msg,
                            title: !learningPlanName || learningPlanName.trim() == "" ? "Title Should Not Be Empty" : !app.checkTitle(learningPlanName) ? "Title has Invalid character" : undefined
                        };
                        if (errors.title || errors.date) {
                            model.set("errors", errors);
                            return;
                        }
                        learningPlanService.createIndividualLearningPlan(learningPlanName, App.DateUtil.formatGmtDateToNormal(date), courseId).then(updateModelData, handleError);
                    } else {
                        learningPlanService.addCourseToLearningPlan(PlanId, courseId, oldLearningPlanId, learningPlanItemId).then(updateModelData, handleError);
                    }
                },
                cancelAddToLp: function () {
                    this.set("learningPlanName", "");
                    jQuery('#addACourseToLP').modal('hide');
                },
                /* openShareModel: function (courseId) {
                    var self = this;
                    var shareModelData = Ember.Object.create({
                        courseId: courseId,
                        userAndGroupdata: []
                    });
                    self.getUsers().then(function (users) {
                        jQuery('#shareCourse').modal('show');
                        var userData = [];
                        _.each(users, function (user, key) {
                            userData.push({
                                "id": user.username + "|" + user.shortName,
                                "name": user.shortName
                            });
                        });
                        shareModelData.set("userAndGroupdata", userData);
                        var modeldata = self.controllerFor('learningCourse').get('model');
                        modeldata.set("sharing", false);
                        modeldata.set("messageStatus", false);
                        modeldata.set("messages", "");
                        self.controllerFor('learningCourse').set('shareModelData', shareModelData);
                    }).catch(function (error) {
                        console.log("error", error);
                    }).done(function () {
                        self.getCourseSharedDetails(courseId)
                            .then(function (alreadySharedData) {
                                var userList = [];
                                _.each(shareModelData.userAndGroupdata, function (value) {
                                    if (!_.findWhere(alreadySharedData, {
                                        share: value.id.split("|")[0]
                                    })) {
                                        userList.pushObject(value);
                                    }
                                });

                                self.controllerFor('learningCourse').set('alreadySharedData', alreadySharedData);
                                if (alreadySharedData.length > 0) {
                                    learningOfferings.shareAutotag(userList, alreadySharedData);
                                } else {
                                    learningOfferings.shareAutotag(userList);
                                }
                            });
                    });
                    Ember.TEMPLATES['shareCourseModelOutletModal'] = Ember.Handlebars.compile(shareTemplete);
                    self.render('shareCourseModelOutletModal', {
                        into: 'learningCourse',
                        outlet: 'shareCourseModelOutlet'
                    });
                }, */
                clearShare: function () {
                    $('input[type=text]').val('');
                    $('textarea').val('');
                    $('input[type=select]').val('');
                    $('input[type=radio]').val('');
                    $('input[type=checkbox]').val('');
                },
                shareCourse: function (courseId, share) {
                    var comment = this.controller.get("model").comment;
                    //var alreadySharedData = this.controllerFor('learningCourse').get('alreadySharedData');
					var share = $('#shareForPost').val();
                    if (!share) {
                        try {
                            Ember.FlashQueue.pushFlash('warning', 'No user to share');
                        } catch (e) {
                            console.log("Error in hiding share dialog");
                        }
                        return;
                    }
                    //var alreadySharedData = this.controllerFor('learningCourse').get('alreadySharedData');
                    var model = this.modelFor('learningCourse');
                    model.set("sharing", true);
                    model.set("messageStatus", false);
                    model.set("messages", "");
                    var sharedJson = [];
                    var sharedWith = share.split(",");
                    var sharedBy = app.getUsername();
                    _.each(sharedWith, function (emailNamePair) {
                        if (emailNamePair == "") {
                            return;
                        }
                        var sharedObject = {};
                        var emailNamePairArr = emailNamePair.split('@')
                        sharedObject.share = emailNamePair;
                        sharedObject.display = emailNamePairArr[0];
                        sharedObject.comment = comment;
                        sharedObject.type = "email";
                        sharedObject.permission = ["read"];
                        sharedJson.push(sharedObject)
                    });
                    var userName = app.getUsername(), userShortName = app.getShortname();
                    learningUserServices.shareCourseDetails(model.courseDetails.courseId, sharedJson, userName, userShortName).then(function (courseSharedDetails) {
                        model.set("messageStatus", true);
                        model.set("sharing", false);
                        model.set("messages", "The changes made to sharing have been updated successfully");
                        var coursesStreamResponse = App.ResourceShareUtil.pushCourseSharesToStream(courseSharedDetails, alreadySharedData, model.courseDetails.title, model.courseDetails.type);
                        if (coursesStreamResponse) {
                            coursesStreamResponse.then(function () {}, function (err) {console.log("Error", err);});
                        }
                    }, function (err) {
                        model.set("messageStatus", false);
                        model.set("sharing", false);
                        model.set("messages", "Unexpected error while sharing");
                        console.log("Error", err);
                    });
                },
                markAsActivityComplete: function (_id, courseId) {
					var controller = this.controller,
						self = this;
                    courseService.updateMarkComplete(_id, courseId).then(function (response) {
                        if (response.courseDetails.code == 1) {
							var currDate = new Date();
							var date = currDate.getTime() / 1000;
							controller.set("markAsComplete", 1);
							controller.set("completedOn", date);
                            jQuery('#markComplete').modal('hide');
							$.gritter.add({title:'', text: 'You have Completed the Course.', class_name: 'gritter-success'});
                        } else {
							$.gritter.add({title:'', text: 'Error in Completing the Course.', class_name: 'gritter-error'});
                        }
                    });
                },
                enrollCourse: function (courseId, categoryid, course, managerApproval) {
					var controller = this.controller,
						self = this;
                    try {
                        courseService.enrollCourse(courseId, managerApproval).then(function (response) {
                            if (response) {
								controller.set("enrollmentStatus", 1);
								controller.set("courseDetails.enrollmentId", response.entity ? response.entity.id : "");
								if (managerApproval) {
									controller.set("pendingApproval", response.entity.status == "PENDING" ? true : false );
								}
								$.gritter.add({title:'', text: 'You have Enrolled into the course successfully.', class_name: 'gritter-success'});
                            } else {
								$.gritter.add({title:'', text: 'Error in enrolling course.', class_name: 'gritter-error'});
                            }
                        });
                    } catch (e) {
						$.gritter.add({title:'', text: 'Unable to enroll to Course.', class_name: 'gritter-error'});
                    }
                },
                cancelCourse: function (courseId, categoryid, enrollmentId) {
					var controller = this.controller,
						self = this;
                    try {
                        courseService.cancelEnrollCourse(enrollmentId, courseId).then(function (response) {
                            if (response) {
                                controller.set("enrollmentStatus", 0);
								controller.set("pendingApproval", false);
								$.gritter.add({title:'', text: 'You have cancelled into the course successfully.', class_name: 'gritter-success'});
                            } else {
								$.gritter.add({title:'', text: 'Error in cancelling enrolling course.', class_name: 'gritter-error'});
                            }
                        });
                    } catch (e) {
						$.gritter.add({title:'', text: 'Unable to cancel to course.', class_name: 'gritter-error'});
                    }
                },
                enrollSession: function (courseId, course, sessionid, managerApproval) {
                    var self = this;
                    try {
                        courseService.enrollSession(courseId, sessionid, managerApproval).then(function (response) {
                            if (response.error == 1) {
								$.gritter.add({title:'', text: 'You have already enrolled to other session of this course.', class_name: 'gritter-error'});
                            } else {
                                if (response) {
                                    var model = self.controller.get('model').sessions;
                                    var sessionsDetails = [];
                                    _.each(model, function (session, coukey) {
                                        if (sessionid == session.sessionId) {
                                            var currDate = new Date();
                                            var date = currDate.getTime() / 1000;
                                            self.controller.get('model').sessions[coukey].sessionEnrollmentStatus = 1;
                                            self.controller.get('model').sessions[coukey].sessionEnrollmentDate = date;
                                            self.controller.get('model').sessions[coukey].launch = response.launch;
											self.controller.get('model').sessions[coukey].enrollmentId = response.entity ? response.entity.id : "";
											if (managerApproval) {
												self.controller.get('model').sessions[coukey].pendingApproval = response.entity.status == "PENDING" ? true : false;
											}
                                        }
                                        sessionsDetails.push(session);
                                    });
                                    self.controller.set('sessions.data', sessionsDetails);
								   $.gritter.add({title:'', text: 'You have Enrolled into the session successfully.', class_name: 'gritter-success'});
                                } else {
									$.gritter.add({title:'', text: 'Error in enrolling session.', class_name: 'gritter-error'});
                                }
                            }
                        }, function (err) {
                            $.gritter.add({title:'', text: 'You have already enrolled to other session of this course.', class_name: 'gritter-error'});
                        });
                    } catch (e) {
						$.gritter.add({title:'', text: 'Unable to enroll to Session.', class_name: 'gritter-error'});
                    }
                },
                cancelSession: function (courseId, course, sessionid, enrollmentId) {
                    var self = this;
                    try {
                        courseService.cancelSession(enrollmentId, courseId, sessionid).then(function (response) {
                            if (response) {
                                var model = self.controller.get('model').sessions;
                                var sessionsDetails = [];
                                _.each(model, function (session, coukey) {
                                    if (sessionid == session.sessionId) {
                                        var currDate = new Date();
                                        var date = currDate.getTime() / 1000;
                                        self.controller.get('model').sessions[coukey].sessionEnrollmentStatus = 0;
                                    }
                                    sessionsDetails.push(session);
                                });
                                self.controller.set('sessions.data', sessionsDetails);
								$.gritter.add({title:'', text: 'You have Cancelled into the session successfully.', class_name: 'gritter-success'});
                            } else {
								$.gritter.add({title:'', text: 'Error in cancelling session.', class_name: 'gritter-error'});
                            }
                        });
                    } catch (e) {
						$.gritter.add({title:'', text: 'Unable to cancel to session.', class_name: 'gritter-error'});
                    }
                }
            }
        });
    });