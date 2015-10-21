'use strict';
define(['app', 'httpClient', 'underscore', 'emberPageble',  'services/formallearning/learningPlanService', 'services/usersService', 'services/formallearning/courseService'],
    function (app, httpClient, _, emberPageble, learningPlanService, usersService, courseService) {
        App.LearningCourseController = Ember.ObjectController.extend(Ember.Evented, {
            queryParams: ['showMessage', 'coursetype'],
            showMessage: false,
            coursetype: '',
			cdFilter:"",
			learningPlanDate:"",
            recentReadersUserData: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: 8
            }),
            sessionCity: "",
            sessionStartDate: "",
            sessionEndDate: "",
            fetchUsers: function () {
                return usersService.usersAutoSuggest();
            }.property('share'),
            actions: {
                onLaunch: function(courseDetails) {
                     var self = this;
                     setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(self.prepareDetailsForLaunchNotification(courseDetails), 'course', 'launch');}), 0);
                     window.open(courseDetails.launch, '_blank');
                 },
                onWebexLaunch: function(courseDetails, session) {
                    var self = this;
                    setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(self.prepareDetailsForLaunchNotification(courseDetails), 'course', 'launch');}), 0);
                    window.open(session.launch, '_blank');
                },
                transition: function (courseDetails) {
                    var self = this;
                    setTimeout((function(){app.NotificationUtils.sendActivityStreamEvent(self.prepareDetailsForLaunchNotification(courseDetails), 'course', 'launch');}), 0);
                    this.transitionTo('launchquiz', {
                        quizId: courseDetails.quizId,
                        courseId: courseDetails.courseId
                    }, {
                        courseId: courseDetails.courseId
                    });
                },
				disabledCourse: function () {
                    $.gritter.add({title: '', text: 'Sorry, new registrations are disabled to this course.', class_name: 'gritter-error'});
                }
             },
            prepareDetailsForLaunchNotification: function(courseDetails) {
               return {
                    id: courseDetails.courseId,
                    title: courseDetails.title,
                    resourceUrl: "#/learningCourse/" + courseDetails.courseId + "?coursetype=" + courseDetails.type
               }
            },
            filterSessionsRecords: function () {
                var self = this,
                    sessionCity = self.get('sessionCity'),
                    sessionStartDate = self.get('sessionStartDate'),
                    sessionEndDate = self.get('sessionEndDate'),
                    filteredData = self.get('model').sessions.copy(),
                    sCount = filteredData.length,
                    libdatefilter = app.DateUtil.sessionFilter;

                var isFilterActive = function (filterVal) {
                    if (filterVal && filterVal != "") {
                        return true;
                    } else {
                        return false;
                    }
                }

                if (isFilterActive(sessionCity)) {
                    if (sessionCity != "All") {
                        filteredData = _.where(filteredData, {
                            "city": sessionCity
                        });
                        sCount = filteredData.length;
                    }
                }

                if (isFilterActive(sessionStartDate) && isFilterActive(sessionEndDate)) {
                    if ([sessionStartDate, sessionEndDate].indexOf("All") > -1) {
                        if (sessionStartDate != sessionStartDate) {
                            if (sessionStartDate == "All") {
                                filteredData = libdatefilter.getSessions(filteredData, sessionEndDate, true);
                                sCount = filteredData.length;
                            } else if (sessionEndDate == "All") {
                                filteredData = libdatefilter.getSessions(filteredData, sessionStartDate);
                                sCount = filteredData.length;
                            }
                        }
                    } else {
                        filteredData = libdatefilter.getSessions(filteredData, sessionStartDate + "-" + sessionEndDate);
                        sCount = filteredData.length;
                    }
                } else if (isFilterActive(sessionStartDate)) {
                    if (sessionStartDate != "All") {
                        filteredData = libdatefilter.getSessions(filteredData, sessionStartDate);
                        sCount = filteredData.length;
                    }
                } else if (isFilterActive(sessionEndDate)) {
                    if (sessionEndDate != "All") {
                        filteredData = libdatefilter.getSessions(filteredData, sessionEndDate, true);
                        sCount = filteredData.length;
                    }
                }
                self.set('sessions.data', filteredData);
                if (self.get('model').set) {
                    self.get('model').set('sessionsCount', sCount);
                }
                self.sessions.set('currentPage', 1);
            }.observes('sessionCity', 'sessionStartDate', 'sessionEndDate'),
			//recent participants sorting
            modify: false,
            showSessionParticipants: function() {
                var self=this,
                    checkbox = this.get('courseDetails.sessions') ? this.get('courseDetails.sessions') : [],
                    sessions = [];
					for (var i = checkbox.length - 1; i >= 0; i--) {
						if (checkbox[i].modify == true) {
							sessions.push(checkbox[i].sessionId);
							self.set("tempCourseId", self.get("model.courseDetails").courseId);
						}
					}
					var courseId = self.get("model.courseDetails") ? self.get("model.courseDetails").courseId : self.get('tempCourseId');
					if(courseId){
						var data = {
							courseid: self.get('model').activityId,
							sessionid: sessions.toString(),
							month: self.get('month') ? self.get('month') : 0,
							completed: self.get('completed') ? self.get('completed') : 0
						}
						courseService.getRecentParticipants(data).then(function (response) {
							if (response) {
							   self.fetchRecentParticipants(response);
							}
						});  
					}
                this.set('sessionsId', sessions.toString());
            }.observes('courseDetails.sessions.@each.modify'),
			participantsFilter: function() {
                var self=this,
                    cdFilter = self.get("cdFilter"),
                    month = "",
                    completed = "",
                    model = self.get('model'),
                    courseId = model.activityId,
                    sessionId = self.get("sessionsId"), 
					data="";
                if (cdFilter == "enrol1month") {
					data = {courseid: courseId,	month: 1, completed: 0, sessionid: sessionId
					}
                } else if (cdFilter == "enrol3month") {
					 data = {courseid: courseId, month: 3, completed: 0, sessionid: sessionId
					}
                } else if (cdFilter == "c1month") {
					 data = {courseid: courseId, month: 1, completed: 1, sessionid: sessionId
					}
                } else if (cdFilter == "c3month") {
                    data = {courseid: courseId, month: 3, completed: 1, sessionid: sessionId
					}
                }else if (cdFilter == "all") {
                    data = {courseid: courseId, month: 0, completed: 0, sessionid: sessionId
					}
                }   
				var month = this.set("month", data.month),
					completed = this.set("completed", data.completed);
                courseService.getRecentParticipants(data).then(function (response) {
					if (response) {
					   self.fetchRecentParticipants(response);
					}
                });    
            }.observes("cdFilter"),
            fetchRecentParticipants: function(response) {
                var self = this;
                var recentReadersUserData = response;
                self.getRecentParticipantsUserEmails(recentReadersUserData).then(function(recentReadersUserData){
                    self.set('model.recentReadersUserData', recentReadersUserData);
                    self.set('recentReadersUserData.data', recentReadersUserData);
                    self.set('recentReadersUserDataLength', recentReadersUserData.length);
					self.set("currentPage", 1);
                })  
            },
            getRecentParticipantsUserEmails: function(recentReaders) {
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
            },
            //setting up pagination for sessions
            sessions: Ember.ArrayController.createWithMixins(VG.Mixins.Pageable, {
                perPage: 4
            }),
            learningPlanNameAdded: function () {
				var learningPlanName = this.get("learningPlanName");
                if (learningPlanName && learningPlanName.length > 0) {
					this.set("showDate", true);
                } else {
					this.set("showDate", false);
                }
            }.observes("learningPlanName"),
            planId: "",
            fetchAllLearningPlan: function(){
                var self = this;
				var data = {
					"keyword": "",
					"limitTo": app.Infinity
				};
                learningPlanService.fetchLearningPlans(data).then(function(allUserLearningPlans){
					var allUserLearningPlans = allUserLearningPlans.learningPlans;
                    var individualLeaningPlans = []
                    if(allUserLearningPlans){
                        allUserLearningPlans.forEach(function(learningPlan){
                            if(learningPlan.type == "Individual"){
                                individualLeaningPlans.push(learningPlan);
                            }
                        })
                    }
                    self.set("model.learningPlans", individualLeaningPlans);
                })
            }
        });
        return app;
    });